unction createLighting (lightingParent) {
	lightingParent.add (new THREE.HemisphereLight (0x808080, 0x606060));

  	var light = new THREE.DirectionalLight (0xffffff);
  	light.position.set (0, 6, 0);
  	light.castShadow = true;
  	light.shadow.camera.top = 2;
  	light.shadow.camera.bottom = -2;
  	light.shadow.camera.right = 2;
  	light.shadow.camera.left = -2;
  	light.shadow.mapSize.set (4096, 4096);
  	lightingParent.add (light);  

}
