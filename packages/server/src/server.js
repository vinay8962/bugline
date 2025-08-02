import { app, PORT } from "./app.js";
import { checkDatabaseConnection, disconnectPrisma } from "./config/prisma.js";
import { 
  logInfo, 
  logError, 
  logSystem, 
  logSecurity 
} from "./utils/logger.js";

let server;

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logSystem(`Server shutdown initiated`, { signal });
  
  if (server) {
    server.close(async () => {
      logSystem("HTTP server closed");
      await disconnectPrisma();
      logSystem("Server shutdown completed");
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(async () => {
      logError("Could not close connections in time, forcefully shutting down");
      await disconnectPrisma();
      process.exit(1);
    }, 10000);
  } else {
    // No server instance (e.g., startup failure)
    logSystem("No server instance to close");
    await disconnectPrisma();
    process.exit(1);
  }
};

// Start server with database health check
const startServer = async () => {
  try {
    logSystem("Starting server initialization");
    
    // Check database connection before starting server
    await checkDatabaseConnection();
    
    server = app.listen(PORT, () => {
      logSystem("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        healthCheck: `http://localhost:${PORT}/health`,
        apiDocs: `http://localhost:${PORT}/docs`
      });
      
      console.log(`🚀 BugLine API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
    });

    // Add error handling for the server
    server.on('error', (error) => {
      logError("Server error occurred", error);
      gracefulShutdown("SERVER_ERROR");
    });

    return server;
  } catch (error) {
    logError("Failed to start server", error);
    
    // Provide more specific error messages
    if (error.message.includes('Database connection failed')) {
      logError("Database connection failed. Please check your DATABASE_URL environment variable.");
    } else if (error.message.includes('EADDRINUSE')) {
      logError("Port is already in use. Please try a different port.");
    } else {
      logError("Unexpected error during server startup.");
    }
    
    gracefulShutdown("STARTUP_ERROR");
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Log process events
process.on('exit', (code) => {
  logSystem(`Process exiting with code ${code}`);
});

process.on('warning', (warning) => {
  logError('Process warning', warning);
});

// Start the server
startServer();
