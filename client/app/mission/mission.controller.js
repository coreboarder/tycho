(function() {
  'use strict';

  angular.module('app')
  .controller('MissionController', MissionController);

  MissionController.$inject = ['$window', 'Mission', 'Vehicle'];

  function MissionController ($window, Mission, Vehicle) {
    var vm = this;

    //View model properties and methods
    vm.missionID = $window.localStorage.missionID;
    vm.mission = {};
    vm.engines = {
      "stage1": {},
      "stage2": {}
    };
    vm.tanks = {
      "stage1": {},
      "stage2": {}
    };

    //Initialization procedures
    getMissionMeta();
    getEngineData();
    getTankData();
    fuelTankGraphic(".s2-tank-graphic .RP1", 2);
    fuelTankGraphic(".s2-tank-graphic .LOX", 2);
    fuelTankGraphic(".s1-tank-graphic .RP1", 1);
    fuelTankGraphic(".s1-tank-graphic .LOX", 1);

    ///////////////////////////////
    ////DATA RETRIEVAL METHODS/////
    ///////////////////////////////

    //Get top level mission meta data
    function getMissionMeta () {
      Mission.getMissionMeta(vm.missionID) 
        .then(function (missionData) {
          for (var key in missionData) {
            vm.mission[key] = missionData[key];
          }
          trajectoryGraphic();
        });
    }

    //Get all engine data for both rocket stages
    function getEngineData () {
      Vehicle.getAllEngines(vm.missionID)
        .then(function (engineData) {
          for (var i = 0; i < engineData.length; i++) {
            var engine = engineData[i];
            if (engine.stage_num === 1) {
              vm.engines.stage1[engine.engine_num] = engine;
            } else if (engine.stage_num === 2) {
              vm.engines.stage2[engine.engine_num] = engine;
            }
          }
          console.log(vm.engines);
        });
    }

    //Get all fuel tank data for both rocket stages
    function getTankData () {
      Vehicle.getAllTanks(vm.missionID)
        .then(function (tankData) {
          for (var i = 0; i < tankData.length; i++) {
            var tank = tankData[i];
            if (tank.stage_num === 1) {
              vm.tanks.stage1[tank.fuel_type] = tank;
            } else if (tank.stage_num === 2) {
              vm.tanks.stage2[tank.fuel_type] = tank;
            }
          }
        });
    }


    ///////////////////////////////
    ///GRAPHIC RENDERING METHODS///
    ///////////////////////////////

    //////////////////////////////////
    //////Fuel Tank Graphics//////////
    //////////////////////////////////

    function fuelTankGraphic (selector, stageNo) {
      var scene = new THREE.Scene();
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      
      if (stageNo === 2) {
        height = height * .35 * .7;
        width = width * .6 * .6 * .34;
      } else {
        height = height * .65 * .8 * .5;
        width = width * .6 * .4 * .5;
      }
      var camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 1000 );
      // var camera = new THREE.OrthographicCamera(- width/1 , width / 1, height / 1, -height /  1, 1, 1000 );
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor( 0xffffff, 0);
      renderer.setSize( width, height);
      $(selector).append( renderer.domElement );

      camera.position.set(0, 0, 67);

      //Lighting
      var light = new THREE.AmbientLight( 0x404040 ); // soft white light
      scene.add( light );

      var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      directionalLight.position.set( -2, 2, 0 );
      scene.add( directionalLight );


      var tankGeometry = new THREE.CylinderGeometry( 25, 25, 40, 30, 30 );
      var tankMaterial = new THREE.MeshPhongMaterial({
        color: 0x65696b,
        emissive: 0x2d2828,
        specular: 0x7f7373,
        wireframe: false,
        transparent: true,
        opacity: .5
      });
      var tank = new THREE.Mesh( tankGeometry, tankMaterial );
      scene.add( tank );


      //Tank top/bottom
      // var tankCapGeometry = new THREE.SphereGeometry(40,40, 30, Math.PI*1.5, Math.PI, 0, 3.1);
      var tankCapGeometry = new THREE.SphereGeometry(27,30, 30, 0, 2*Math.PI, 0, 1.2);
      var tankTop = new THREE.Mesh(tankCapGeometry, tankMaterial)
      scene.add(tankTop);
      tankTop.position.y = 10;
      // tankTop.rotation.x = Math.PI / 2 ;
      // tankTop.rotation.z = -Math.PI/2;


      var tankBottom = new THREE.Mesh(tankCapGeometry, tankMaterial)
      scene.add(tankBottom);
      tankBottom.position.y = -10;
      tankBottom.rotation.z = -Math.PI;

      var fuelSpecs = {
        radius: 24,
        height: 40,
        radialSegments: 30,
        heightSegments: 30
      }

      var fuelGeometry = new THREE.CylinderGeometry(fuelSpecs.radius, fuelSpecs.radius, fuelSpecs.height, fuelSpecs.radialSegments, fuelSpecs.heightSegments);
      var fuelMaterial = new THREE.MeshPhongMaterial({
        color: 0x117cb1,
        emissive: 0x0b1b91,
        specular: 0x1e1a1a
      });
      var fuel = new THREE.Mesh(fuelGeometry, fuelMaterial);
      scene.add(fuel);

      // var fuelCapGeometry = new THREE.SphereGeometry(39,30, 30, Math.PI*1.5, Math.PI, 0, 3.1);
      var fuelCapGeometry = new THREE.SphereGeometry(25,30, 30, 0, 2*Math.PI, 0, 1.3);
      var fuelBottom = new THREE.Mesh(fuelCapGeometry, fuelMaterial);
      scene.add(fuelBottom);
      fuelBottom.position.y = -11;
      fuelBottom.rotation.z = Math.PI;

      var vec = new THREE.Vector3( 0, 0, 0 );
    
      //Rendering & animation loop
      var render = function (actions) {
        camera.lookAt(vec)
        renderer.render(scene, camera);
        requestAnimationFrame( render );
      };
      render();
    }


    //////////////////////////////////
    ///Earth & Vehicle Trajectory/////
    //////////////////////////////////

    function trajectoryGraphic () {
      var width = $window.innerWidth * .3;
      var height = $window.innerHeight * .52;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera( 75, width/height , 0.1, 1000 );

      var renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize( width, height );
      $(".trajectory").append( renderer.domElement );
      
      var orbit = new THREE.OrbitControls(camera, renderer.domElement);

      var light = new THREE.AmbientLight( 0x888888 )
      scene.add( light )

      var light = new THREE.DirectionalLight( 0xFFFFFF)
      light.position.set(50,50,50)
      scene.add( light )

      //Define parameters for scaling data values to map size
      var scale = 50 / 6731;
      var offset = 50;
      var apogee = vm.mission.apogee * scale + offset;
      var perigee = vm.mission.perigee * scale + offset;
      var target_apogee = vm.mission.target_apogee * scale + offset;
      var target_perigee = vm.mission.target_perigee * scale + offset;

      //Given altitude, latitude, and longitude, determine (x,y,z)
      //Convert lat, lng to radians
      var lat = vm.mission.latitude * (Math.PI / 180);
      var lng = vm.mission.longitude * (Math.PI / 180);
      var altitude = vm.mission.altitude * scale + offset;
      var pos_y = altitude * Math.sin(lat);
      var pos_x = altitude * Math.cos(lng);
      var pos_z = altitude * Math.sin(lng);
      var position = [pos_x, pos_y, pos_z];
      var cam_position = [position[0], position[1] - offset/2, position[2]];

      var inclination = vm.mission.inclination * (Math.PI / 180);
      var targetInclination = vm.mission.target_inclination * (Math.PI / 180);
      console.log(altitude);
      console.log(position);


      //EARTH
      var radius = 50;
      var segments = 32;
      var rings = 32;

      var earthGeometry = new THREE.SphereGeometry(radius, segments, rings);
      var earthMaterial = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture("../../assets/earth_3.jpg")
        // bumpMap: THREE.ImageUtils.loadTexture("../../assets/earth_bump.jpg"),
        // color: 0xaaaaaa,
        // ambient: 0xaaaaaa,
        // specular: 0x333333,
        // bumpScale: 0.2,
        // shininess: 10
      });
      var earth = new THREE.Mesh( earthGeometry, earthMaterial );
      scene.add( earth );

      //Clouds
      var cloudGeometry = new THREE.SphereGeometry(51,  50, 50);
      var cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.ImageUtils.loadTexture("../../assets/earthcloudmaptrans.jpg"),
        transparent: true,
        opacity: 0.08
      });
      var clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.add(clouds);

      //Stars
      var starsGeometry  = new THREE.SphereGeometry(150, 32, 32)
      var starMaterial  = new THREE.MeshBasicMaterial()
      starMaterial.map   = THREE.ImageUtils.loadTexture('../../assets/galaxy_starfield.png')
      starMaterial.side  = THREE.BackSide
      var starField  = new THREE.Mesh(starsGeometry, starMaterial)
      scene.add(starField);

      //Spacecraft
      var radius = .5;
      var segments = 32;
      var rings = 32;

      var craftGeometry = new THREE.SphereGeometry(radius, segments, rings);
      var craftMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
      var craft = new THREE.Mesh( craftGeometry, craftMaterial );
      craft.position.set(position[0], position[1], position[2]);
      scene.add( craft );

      //Current Trajectory - Conditional check for changing camera location/orientation
      //based on current vehicle perigee.
      var focus_vector;
      if (vm.mission.perigee > 0) {
        //Draw elliptical orbit
        var ellipseMaterial = new THREE.LineBasicMaterial({color:0xffffff, opacity:1});
        var ellipse = new THREE.EllipseCurve(
          0, 0, 
          perigee, apogee,
          0, 2.0 * Math.PI, 
          false);
        var ellipsePath = new THREE.CurvePath(ellipse.getPoints(1000));
        ellipsePath.add(ellipse);
        var ellipseGeometry = ellipsePath.createPointsGeometry(100);
        var currentTrajectory = new THREE.Line(ellipseGeometry, ellipseMaterial);
        scene.add( currentTrajectory );
        currentTrajectory.rotation.x = Math.PI / 2;
        currentTrajectory.rotation.y = inclination;

        focus_vector = new THREE.Vector3(0, 0, 0);
        camera.position.set(0, 20, 100);
      } else {
        //Draw parabolic trajectory based off of current apogee
        var curve = new THREE.QuadraticBezierCurve(
          new THREE.Vector3( offset, 0, -apogee ),
          new THREE.Vector3( offset + apogee, 0, 0 ),
          new THREE.Vector3( offset, 0, apogee )
        );
        var path = new THREE.Path( curve.getPoints( 50 ) );
        var geometry = path.createPointsGeometry( 50 );
        var material = new THREE.LineBasicMaterial( { color : 0xffffff } );
        var currentTrajectory = new THREE.Line( geometry, material );
        scene.add(currentTrajectory);

        focus_vector = new THREE.Vector3(position[0], position[1], position[2]);
        camera.position.set(cam_position[0], cam_position[1], cam_position[2]);
      }

      //Target trajectory / orbit
      var targetMaterial = new THREE.LineDashedMaterial({
        color: 0xb3ebff, 
        opacity:1, 
        dashSize: 8,
        gapSize: 1
      });
      var targetOrbit = new THREE.EllipseCurve(
        0,0,
        target_perigee, target_apogee, 
        0, 2.0 * Math.PI, 
        false);
      var targetPath = new THREE.CurvePath(targetOrbit.getPoints(1000));
      targetPath.add(targetOrbit);
      var targetGeometry = targetPath.createPointsGeometry(100);
      var targetTrajectory = new THREE.Line(targetGeometry, targetMaterial);
      scene.add( targetTrajectory );
      targetTrajectory.rotation.x = Math.PI / 2;
      targetTrajectory.rotation.y = targetInclination;

      var vec = new THREE.Vector3( 0, 0, 0 );


      var render = function (actions) {
        earth.rotation.y += .0003;
        clouds.rotation.y += .0001;
        camera.lookAt(focus_vector);
        renderer.render(scene, camera);
        requestAnimationFrame( render );
      };
      render();
    }
  }

})();