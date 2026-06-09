

import * as THREE from '../three/build/three.module.js';

			//import { TIFFLoader } from '../three/addons/loaders/TIFFLoader.js';
			import { TIFFLoader } from '../three/examples/jsm/loaders/TIFFLoader.js';

			let renderer, scene, camera;

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
				camera.position.set( 0, 0, 4 );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				scene = new THREE.Scene();

				const loader = new TIFFLoader();

        var scale = 2.5;
        var xpos = 2;
        var aspect =  0.77;
        
				const geometry = new THREE.PlaneGeometry(scale * aspect, scale);

				// uncompressed

				loader.load( './BoK/114v.tif', function ( texture ) {

					texture.colorSpace = THREE.SRGBColorSpace;

					const material = new THREE.MeshBasicMaterial( { map: texture } );

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.set( -xpos, 0, 0 );

					scene.add( mesh );

					render();

				} );

				// LZW

				loader.load( './BoK/124r.tif', function ( texture ) {

					texture.colorSpace = THREE.SRGBColorSpace;

					const material = new THREE.MeshBasicMaterial( { map: texture } );

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.set( 0, 0, 0 );

					scene.add( mesh );

					render();

				} );

				// JPEG

				loader.load( './BoK/291v.tif', function ( texture ) {

					texture.colorSpace = THREE.SRGBColorSpace;

					const material = new THREE.MeshBasicMaterial( { map: texture } );

					const mesh = new THREE.Mesh( geometry, material );
					mesh.position.set( xpos, 0, 0 );

					scene.add( mesh );

					render();

				} );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}


			//

			function render() {

				renderer.render( scene, camera );

			}


