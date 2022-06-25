![sk2](https://user-images.githubusercontent.com/28584767/174356896-4cd0fe5a-7c88-465e-bea7-51c40eb3740e.jpg)


# THREE.ShaderKit
Minimal shader code editor plugin for quick edit on demand. Only needs to be placed in the code and will be available as global variable, specifically to be used with Devtools.

In Devtools open the overlay this way. You might also implement it in your app or game for a debug mode context menu to open by click selection.

```javascript
sk.edit( mesh.material )
```

Only after first calling for the editor it will be created so it can stay in the codebase while development. If `full` is enabled before first being used, it will inject Codemirror, otherwise it's a plain text editor.
![sk1](https://user-images.githubusercontent.com/28584767/174357800-2e673f81-d658-4d6e-9842-10a9d6b67e34.jpg)

To always inject Codemirror enable it in your code. The Codemirror editor is setup with basic functionality and a search plugin, i might restructure it so it can be extended more easily. The js and css files for codemirror can be set in `sk.editor.js`and `sk.editor.css` both being array of URLs, which you might set yourself as i could not find a CDN link for the GLSL mode for Codemirror and hosted it on my server.

```javascript
// Somewhere in code after plugin is included to use Codemirror
sk.full = true;
```
# Demo
https://codepen.io/Fyrestar/embed/QWQPjQL
