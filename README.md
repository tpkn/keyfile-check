
## Usage
```javascript
const kc = require('keyfile-check');

// Proccess started
kc.on('checking', e => {
   console.log(e.message);
});

// Keyfile exist
kc.on('key', e => {
   console.log(e.message);
});

// Verification succeeded
kc.on('success', e => {
   console.log(e.message);
});

// Any errors
kc.on('fail', e => {
   console.log(e.message);
});


let keyfile = path.join(process.cwd(), 'key.file');
kc.check({key: keyfile, server: 'http://localhost:3000/activate', uid: Date.now()});
```

