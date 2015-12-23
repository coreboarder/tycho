(function() {
  'use strict';

  angular.module('app')
  .controller('MissionController', MissionController);

  MissionController.$inject = ['$window', 'Mission', 'Vehicle'];

  function MissionController ($window, Mission, Vehicle) {
    var vm = this;

    //View model properties and methods
    vm.missionID = $window.localStorage.missionID;
    vm.missionName = '';
    vm.heading = 0;
    vm.velocity = 0;
    vm.altitude = 0;
    vm.latitude = 0;
    vm.longitude = 0;
    vm.apogee = 0;
    vm.perigee = 0;
    vm.inclination = 0;
    vm.timestamp;
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
    drawTrajectory();
    s1EngineGraphic();
    s2EngineGraphic();
    fuelTankGraphic(".s2-tank-graphic .RP1", 2);
    fuelTankGraphic(".s2-tank-graphic .LOX", 2);
    fuelTankGraphic(".s1-tank-graphic .RP1", 1);
    fuelTankGraphic(".s1-tank-graphic .LOX", 1);
    //Scope methods

    //Non scope methods
    function getMissionMeta () {
      Mission.getMissionMeta(vm.missionID) 
        .then(function (missionData) {
          vm.missionID = missionData.id;
          vm.missionName = missionData.name;
          vm.heading = missionData.heading;
          vm.velocity = missionData.velocity;
          vm.altitude = missionData.altitude;
          vm.latitude = missionData.latitude;
          vm.longitude = missionData.longitude;
          vm.apogee = missionData.apogee;
          vm.perigee = missionData.perigee;
          vm.inclination = missionData.inclination;
          vm.timestamp = missionData.last_updated;
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


    //Create Stage 1 engine graphic
    function s1EngineGraphic () {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera( 75, $window.innerWidth/$window.innerHeight, 0.1, 1000 );
      camera.position.set(0,0,300)

      var renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize( $window.innerWidth * .3, $window.innerHeight * .3 );
      $(".s1-engine-graphic").append( renderer.domElement );

      var light = new THREE.AmbientLight( 0x888888 )
      scene.add( light )

      var light = new THREE.DirectionalLight( 0xcccccc, 1 )
      light.position.set(5,3,5)
      scene.add( light )

      var radius = 50;
      var segments = 50;
      var geometry = new THREE.CircleGeometry(radius, segments);
      var material = new THREE.MeshPhongMaterial({color: 0x017101});

      //Create all 9 engines
      var engine1 = new THREE.Mesh( geometry, material );
      var engine2 = new THREE.Mesh( geometry, material );
      var engine3 = new THREE.Mesh( geometry, material );
      var engine4 = new THREE.Mesh( geometry, material );
      var engine5 = new THREE.Mesh( geometry, material );
      var engine6 = new THREE.Mesh( geometry, material );
      var engine7 = new THREE.Mesh( geometry, material );
      var engine8 = new THREE.Mesh( geometry, material );
      var engine9 = new THREE.Mesh( geometry, material );


      scene.add( engine1 );
      scene.add( engine2 );
      scene.add( engine3 );
      scene.add( engine4 );
      scene.add( engine5 );
      scene.add( engine6 );
      scene.add( engine7 );
      scene.add( engine8 );
      scene.add( engine9 );

      engine2.position.set(0, 150, 0);
      engine3.position.set(100, 100, 0);
      engine4.position.set(150, 0, 0);
      engine5.position.set(100, -100, 0);
      engine6.position.set(0, -150, 0);
      engine7.position.set(-100, -100, 0);
      engine8.position.set(-150, 0, 0);
      engine9.position.set(-100, 100, 0);


      //Add outline around engines
      var outline = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        205, 205,           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation 
      );

      var path = new THREE.Path( outline.getPoints( 50 ) );
      var outlineGeometry = path.createPointsGeometry( 50 );
      var outlineMaterial = new THREE.LineBasicMaterial( { color : 0xCFC2C2 } );
      var ellipse = new THREE.Line( outlineGeometry, outlineMaterial );

      scene.add(ellipse)


      var render = function () {
        requestAnimationFrame( render );
        renderer.render(scene, camera);
      };

      render();
    }

    //Create stage 2 engine graphic
    function s2EngineGraphic() {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
      camera.position.set(0,0,80)

      var width = $window.innerWidth;
      var height = $window.innerHeight;
      width = width * .6 * .45 * .2;
      height = height * .35 * .3;

      var renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setSize( width, height );
      $(".s2-engine-graphic").append( renderer.domElement );

      var light = new THREE.AmbientLight( 0x888888 )
      scene.add( light )

      var light = new THREE.DirectionalLight( 0xcccccc, 1 )
      light.position.set(5,3,5)
      scene.add( light )

      var radius = 50;
      var segments = 50;
      var geometry = new THREE.CircleGeometry(radius, segments);
      var material = new THREE.MeshPhongMaterial({color: 0x017101});

      //Create all 9 engines
      var engine1 = new THREE.Mesh( geometry, material );

      scene.add( engine1 );

      var render = function () {
        requestAnimationFrame( render );
        renderer.render(scene, camera);
      };
      render();
    }

    //////////////////////////////////
    ///////////FUEL TANKS/////////////
    //////////////////////////////////

    function fuelTankGraphic (selector, stageNo) {
      var scene = new THREE.Scene();
      var width = $window.innerWidth;
      var height = $window.innerHeight;
      var camera = new THREE.PerspectiveCamera( 75, 1.3, 0.1, 1000 );
      
      if (stageNo === 2) {
        height = height * .35 * .7;
        width = width * .6 * .55 * .3;
      } else {
        height = height * .65 * .8 * .5;
        width = width * .6 * .4 * .5;
      }
      // var camera = new THREE.OrthographicCamera(- width/1 , width / 1, height / 1, -height /  1, 1, 1000 );
      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize( width, height);
      $(selector).append( renderer.domElement );

      camera.position.set(0, 0, 120);

      //Orbit Controls
      var orbit = new THREE.OrbitControls(camera, renderer.domElement);

      //Lighting
      var light = new THREE.AmbientLight( 0x404040 ); // soft white light
      scene.add( light );

      var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      directionalLight.position.set( -2, 2, 0 );
      scene.add( directionalLight );


      var tankGeometry = new THREE.CylinderGeometry( 40, 40, 70, 30, 30 );
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
      var tankCapGeometry = new THREE.SphereGeometry(40,40, 30, Math.PI*1.5, Math.PI, 0, 3.1);
      var tankTop = new THREE.Mesh(tankCapGeometry, tankMaterial)
      scene.add(tankTop);
      tankTop.position.y = 34;
      // tankTop.rotation.x = Math.PI / 2 ;
      tankTop.rotation.z = -Math.PI/2;


      var tankBottom = new THREE.Mesh(tankCapGeometry, tankMaterial)
      scene.add(tankBottom);
      tankBottom.position.y = -34;
      tankBottom.rotation.z = Math.PI/2;

      var fuelSpecs = {
        radius: 39,
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
      fuel.position.y = -13;

      var fuelCapGeometry = new THREE.SphereGeometry(39,30, 30, Math.PI*1.5, Math.PI, 0, 3.1);
      var fuelBottom = new THREE.Mesh(fuelCapGeometry, fuelMaterial);
      scene.add(fuelBottom);
      fuelBottom.position.y = -32;
      fuelBottom.rotation.z = Math.PI/2;

      ///////////////////////////
      /// RENDERING/ANIM LOOP ///
      ///////////////////////////

      var vec = new THREE.Vector3( 0, 0, 0 );
    
      var render = function (actions) {
        if (fuel.scale.y > 0) {
          fuel.scale.y -= .001;
          fuel.position.y -= .02;
        } else {
          fuel.visible = false;
        }

        camera.lookAt(vec)
        renderer.render(scene, camera);
        requestAnimationFrame( render );
      };
      render();
    }



    //Creating the trajectory map
    function drawTrajectory () {
      var canvas = $(".trajectory-canvas")[0];
      console.log(canvas);

      //Distance scaling constant
      var D = canvas.height / ( 5 * 6371 );
      var radiusEarth = canvas.height / 5;

      var center = [canvas.width/2, canvas.height/2];
      var ctx = canvas.getContext("2d");
      //Set apogee and perigee
      var perigee = [center[0], center[1] - vm.perigee * D - radiusEarth - 100];
      var apogee = [center[0], center[1] + vm.apogee * D + radiusEarth + 100];
      console.log("Center: ", center);
      console.log("Perigee: ", perigee);
      console.log("Apogee: ", apogee);
 
      //Draw earth
      ctx.beginPath();
      ctx.arc(center[0], center[1], radiusEarth, 0, 2*Math.PI);
      ctx.fillStyle = "#0000A0";
      ctx.fill()
      ctx.strokeStyle = "#0000A0";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();

      //Draw apogee and perigee
      ctx.beginPath(); 
      ctx.arc(perigee[0], perigee[1], 6, 0, 2*Math.PI);
      ctx.fillStyle = "#FFF";
      ctx.fill()
      ctx.strokeStyle = "#FFF";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(apogee[0], apogee[1], 6, 0, 2*Math.PI);
      ctx.stroke();
      ctx.fill();

      //Apogee/Perigee text markers
      ctx.font = "20px Helvetica Neue";
      ctx.fillText("Pg", perigee[0] + 8, perigee[1] - 8);
      ctx.fillText("Ap", apogee[0] + 8, apogee[1] - 8);

      //Draw vehicle trajectory
      ctx.beginPath();
      ctx.moveTo(perigee[0], perigee[1]); // A1 (Perigee)
      ctx.setLineDash([3,3]);
      ctx.bezierCurveTo(
        center[0] + 1.5 * radiusEarth, perigee[1], // C1
        center[0] + 1.5 * radiusEarth, apogee[1], // C2
        apogee[0], apogee[1]); // A2 (Apogee)
      ctx.bezierCurveTo(
        center[0] - 1.5 * radiusEarth, apogee[1], // C3
        center[0] - 1.5 * radiusEarth, perigee[1], // C4
        perigee[0], perigee[1]); // A1 (Back to Perigee)
      ctx.strokeStyle = "#FFF";
      ctx.stroke();
      ctx.closePath();

    }

    
  }

})();