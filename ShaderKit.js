// Author: Fyrestar https://mevedia.com (https://github.com/Fyrestar/THREE.ShaderKit)
( ( scope ) => {

	let dom, sk;
	let elements = {};

	function touch( element, callback ) {

		element.addEventListener( 'click', callback );
		element.addEventListener( 'touchstart', callback );

	}

	function input( element, editor, callback ) {

		new ResizeObserver(resize).observe( element.parentNode.parentNode );

		function resize() {

			if ( sk.full && sk.loaded ) {

				let style = window.getComputedStyle( element.parentNode, null );
				editor.setSize( style.width, style.height );

				editor.on( 'change', function () {

					dom.setAttribute( 'state', 'changed' );

				});

			}
			
		}

		element.addEventListener( 'keydown', function ( e ) {

			if ( e.ctrlKey && e.key === 's' ) {
				
				e.preventDefault();

				sk.save();

				return false;

			} else if ( e.key === 'Tab' ) {

				e.preventDefault();

				const start = this.selectionStart;
				const end = this.selectionEnd;
			
				this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
				this.selectionStart = this.selectionEnd = start + 1;
			
			}

			dom.setAttribute( 'state', 'changed' );
				
		} );

	}

	sk = {
		vertexShader: '',
		fragmentShader: '',
		material: null,
		elements,
		js: [
			'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js',
			'https://mevedia.com/share/glsl.js',
			'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/search/search.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/search/searchcursor.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/selection/active-line.min.js'
		],
		css: [
			'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css'
		],

		mode: 'glsl',
		used: false,
		loaded: false,
		full: true,
		editor: {
			config: {},
			vertex: null,
			fragment: null
		},
		ready: function () {},
		use: function ( full = this.full ) {
			
			this.full = full;
			this.used = true;

			const temp = document.createElement( 'div' );
			const self = this;

			function setupEditor( textarea ) {

				const config = {
					lineNumbers: true,
					indentWithTabs: true,
					mode: self.mode,
					value: textarea.value,
					'Ctrl-S': function( instance ) { 
						self.save();
					}
				};

				Object.assign( config, self.editor.config );

				return CodeMirror.fromTextArea( textarea, config );

				

			}

			function ready() {

				self.loaded = true;

				if ( full ) {

					self.editor.vertex = setupEditor( elements.vertex );
					self.editor.fragment = setupEditor( elements.fragment );

				}
				
				input( elements.vertex, self.editor.vertex );
				input( elements.fragment, self.editor.fragment );

				self.ready( self );

			}

			let header = '';
			
			// External styles

			if ( full ) for ( let css of this.css )
			header += `<link rel="stylesheet" href="${css}">`;

			temp.innerHTML = `<div class="sk" style="display:none;">
				${header}
				<style>
				.CodeMirror { position: absolute;}
				.sk {
					position: fixed;
					z-index: 999;
					font-family: system-ui;
					flex-direction: column;
					right: 0;
					top: 0;
					width: 30vw;
					height: 100vh;
					max-height: 100%;
					background-color: #272727cf;
					color: white;
					padding: 0.5em;
					box-shadow: 0 0 0 4px grey;
				}
				.sk[state="changed"] #update {
					background: orange;
				}
				.sk textarea {
					width: 100%;
					height: 100%;
					white-space: nowrap;
					margin: 0.25em;
					color: black;
					font-weight: normal;
					font-size: initial;
					font-family: Courier New;
					padding: 0.25em;
					border-radius: 0;
					border: none;
				}
				.sk-button {
					margin: 0.5em;
					padding: 0.5em 1em;
					border-radius: 0;
					background: gray;
					color: white;
					border: none;
					box-shadow: none;
					align-self: baseline;
				}
				.sk button:hover { background: #6d6d6d; }
				.sk button:active { background: #575757; }
				.sk-label { padding: 4px;}
				.sk-box { position: relative; flex-grow: 1;}
				.sk-toolbar { display: flex; justify-content: end;padding: 1em 0; }
				.sk-x { display: flex;flex-direction: row; }
				.sk-y { display: flex;flex-direction: column; }
				.sk-grow { display: flex; flex-grow: 1 };
				</style>
				<div class="sk-y sk-grow"><div class="sk-label">Vertex <button id="copyVertex" class="sk-button">Copy</button></div><div class="sk-box"><textarea id="vertex" class="sk-grow" autocorrect="off" spellcheck="false" autocapitalize="off"></textarea></div></div>
				<div class="sk-y sk-grow"><div class="sk-label">Fragment <button id="copyFragment" class="sk-button">Copy</button></div><div class="sk-box"><textarea id="fragment" class="sk-grow" autocorrect="off" spellcheck="false" autocapitalize="off"></textarea></div></div>
				<div class="sk-toolbar">
					<div class="sk-x sk-label sk-grow"><div id="name"></div></div>
					<button id="revert" class="sk-button">Revert</button>
					<button id="update" class="sk-button">Update</button>
					<button id="cancel" class="sk-button">Cancel</button>
				</div>
			</div>`;

			dom = temp.childNodes[ 0 ];

			const nodes = dom.querySelectorAll( '[id]');

			for ( let node of nodes )
				elements[ node.id ] = node;

			temp.removeChild( dom );

			document.body.appendChild( dom );


			// Load scripts

			if ( full ) {

				let length = this.js.length;
				let loaded = 0;

				for ( let js of this.js ) {

					const script = document.createElement( 'script' );
					script.onload = function ( e ) {

						loaded ++;
						if ( loaded === length ) ready();

					}
					script.async  = false;
					script.src = js;

					dom.appendChild( script );

				}

			} else ready();

			// Event handling

			touch( elements.revert, e => this.revert() );
			touch( elements.update, e => this.save() );
			touch( elements.cancel, e => this.close() );

			touch( elements.copyVertex, e => navigator.clipboard.writeText( this.getVertex() ) );
			touch( elements.copyFragment, e => navigator.clipboard.writeText( this.getFragment() ) );

		},
		set: function ( material ) {

			if ( !this.used ) this.use();


			if ( !material ) this.close();

			this.material = material;

			dom.style.display = 'flex';

			let name = ( material.name || material.id || material.uuid );

			if ( name === material.type )
				name = material.id || material.uuid;

			elements.name.innerHTML = 'Material: ' + name + ` (<b>${material.type}</b>)`;

			elements.vertex.value = material.vertexShader;
			elements.fragment.value = material.fragmentShader;

			if ( this.full && this.loaded ) {

				this.editor.vertex.setValue( material.vertexShader );
				this.editor.fragment.setValue( material.fragmentShader );

			}

			dom.setAttribute( 'state', '' );


		},
		edit: function ( material, full = this.full ) {

			this.full = full;
			
			if ( !this.used ) this.use();

			this.vertexShader = material.vertexShader;
			this.fragmentShader = material.fragmentShader;

			this.set( material );

		},
		revert: function () {

			this.save( this.fragmentShader, this.vertexShader );
			this.set( this.material );

		},
		getVertex: function () {
			return this.full && this.loaded ? this.editor.vertex.getValue() : this.elements.vertex.value;
		},
		getFragment: function () {
			return this.full && this.loaded ? this.editor.fragment.getValue() : this.elements.fragment.value;
		},
		save: function ( fragmentShader = '', vertexShader = '' ) {

			if ( this.material ) {

				const material = this.material;

				material.vertexShader = vertexShader || this.getVertex();
				material.fragmentShader = fragmentShader || this.getFragment();
				material.needsUpdate = true;

				dom.setAttribute( 'state', '' );
			}

		},
		close: function () {
			
			this.material = null;
			this.vertexShader = '';
			this.fragmentShader = '';

			dom.setAttribute( 'state', '' );
			dom.style.display = 'none';

		}
	};

	if ( scope ) scope.sk = sk;

})( self || window );
