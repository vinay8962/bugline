# BugLine Widget SDK

A lightweight, embeddable JavaScript widget for capturing and reporting bugs directly from your web application.

## Features

- 🚀 **Easy Integration** - Single script tag integration
- 🔧 **Auto Error Capture** - Automatically catches JavaScript errors and unhandled promise rejections
- 🎨 **Customizable UI** - Floating button with configurable position and styling
- 📱 **Mobile Friendly** - Responsive design that works on all devices
- 🔒 **Secure** - Project token-based authentication with domain restrictions
- 📊 **Rich Context** - Captures browser info, environment data, and error details
- ⚡ **Lightweight** - Only ~24KB minified

## Quick Start

### 1. Include the Script

```html
<script src="https://cdn.bugline.co/widget/v1/widget.min.js"></script>
```

### 2. Initialize the Widget

```html
<script>
  BugLine.init({
    projectToken: 'your-project-token-here',
    position: 'bottom-right',
    autoErrorCapture: true
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectToken` | `string` | **Required** | Your project's unique token |
| `position` | `string` | `'bottom-right'` | Button position: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, `'center-right'`, `'center-left'` |
| `autoErrorCapture` | `boolean` | `true` | Automatically capture JavaScript errors |
| `apiUrl` | `string` | `auto` | Custom API endpoint URL |
| `customCSS` | `string` | `''` | Additional CSS for customization |
| `onLoad` | `function` | `null` | Callback when widget loads |
| `onBugReported` | `function` | `null` | Callback when bug is reported |
| `onError` | `function` | `null` | Callback when error occurs |

## Advanced Configuration

```html
<script>
  BugLine.init({
    projectToken: 'your-project-token',
    position: 'bottom-right',
    autoErrorCapture: true,
    
    // Callbacks
    onLoad: () => {
      console.log('BugLine widget loaded');
    },
    onBugReported: (result) => {
      console.log('Bug reported:', result.bugId);
      // Show success message to user
    },
    onError: (error) => {
      console.error('Widget error:', error);
    },
    
    // Custom styling
    customCSS: `
      .bugline-floating-button {
        background: linear-gradient(45deg, #ff6b6b, #ffa500) !important;
      }
    `
  });
</script>
```

## API Methods

### `BugLine.init(config)`
Initialize the widget with configuration options.

### `BugLine.show()`
Show the bug report modal programmatically.

### `BugLine.hide()`
Hide the floating button and modal.

### `BugLine.showWidget()`
Show the floating button.

### `BugLine.reportBug(data)`
Manually report a bug with custom data.

```javascript
BugLine.reportBug({
  title: 'Custom Bug Report',
  description: 'Description of the issue',
  priority: 'high',
  reporter_email: 'user@example.com'
});
```

### `BugLine.destroy()`
Completely remove the widget from the page.

## Auto-initialization

You can auto-initialize the widget by defining a global config object before loading the script:

```html
<script>
  window.BugLineConfig = {
    projectToken: 'your-project-token',
    position: 'bottom-left',
    autoErrorCapture: true
  };
</script>
<script src="https://cdn.bugline.co/widget/v1/widget.min.js"></script>
```

## Development

### Building the Widget

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Watch mode
npm run watch
```

### Testing

Open `test.html` in your browser to test widget functionality:

```bash
# Start development server
npm run serve
```

Then visit `http://localhost:3001` to access the test page.

### Project Structure

```
packages/widget/
├── src/
│   ├── core/
│   │   ├── widget.js       # Main widget class
│   │   └── api.js          # API client
│   ├── capture/
│   │   └── errorCapture.js # Error capture functionality
│   ├── ui/
│   │   ├── button.js       # Floating button component
│   │   └── modal.js        # Bug report modal
│   └── utils/
│       ├── validation.js   # Input validation
│       └── helpers.js      # Utility functions
├── dist/
│   ├── widget.js           # Development build
│   └── widget.min.js       # Production build (minified)
├── test.html               # Test page
└── webpack.config.js       # Build configuration
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## Security

- All bug reports are authenticated using project tokens
- Domain restrictions prevent unauthorized usage
- Input validation and sanitization on both client and server
- No sensitive data is stored in localStorage

## CDN Hosting

The widget is available on our CDN:

- Latest: `https://cdn.bugline.co/widget/latest/widget.min.js`
- Versioned: `https://cdn.bugline.co/widget/v1.0.0/widget.min.js`

## Troubleshooting

### Widget Not Loading

1. Check that the project token is correct
2. Verify domain restrictions in your project settings
3. Check browser console for errors
4. Ensure the CDN URL is accessible

### Auto Error Capture Not Working

1. Verify `autoErrorCapture: true` in configuration
2. Check that errors are actually being thrown (not caught)
3. Review error filtering logic (some errors are intentionally skipped)

### Modal Not Showing

1. Check that the floating button is visible
2. Verify no CSS conflicts are hiding the modal
3. Check browser console for JavaScript errors

## Support

- Documentation: [https://docs.bugline.co/widget](https://docs.bugline.co/widget)
- GitHub Issues: [https://github.com/bugline/widget/issues](https://github.com/bugline/widget/issues)
- Support Email: support@bugline.co

## License

MIT License - see LICENSE file for details.