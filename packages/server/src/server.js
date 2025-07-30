import { app, PORT } from "./app.js";
import { checkDatabaseConnection, disconnectPrisma } from "./config/prisma.js";

let server;

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      await disconnectPrisma();
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(async () => {
      console.error("Could not close connections in time, forcefully shutting down");
      await disconnectPrisma();
      process.exit(1);
    }, 10000);
  } else {
    // No server instance (e.g., startup failure)
    console.log("No server instance to close");
    await disconnectPrisma();
    process.exit(1);
  }
};

// Start server with database health check
const startServer = async () => {
  try {
    // Check database connection before starting server
    await checkDatabaseConnection();
    
    server = app.listen(PORT, () => {
      console.log(`🚀 BugLine API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
    });

    // Add error handling for the server
    server.on('error', (error) => {
      console.error("Server error:", error.message);
      gracefulShutdown("SERVER_ERROR");
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error.message);
    
    // Provide more specific error messages
    if (error.message.includes('Database connection failed')) {
      console.error("❌ Database connection failed. Please check your DATABASE_URL environment variable.");
    } else if (error.message.includes('EADDRINUSE')) {
      console.error("❌ Port is already in use. Please try a different port.");
    } else {
      console.error("❌ Unexpected error during server startup.");
    }
    
    gracefulShutdown("STARTUP_ERROR");
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();
