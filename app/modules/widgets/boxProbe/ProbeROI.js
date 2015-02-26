'use strict';

var VJS = VJS || {};
VJS.Widgets = VJS.Widgets || {};

VJS.Widgets.ProbeROI = function() {
    this.domElement = null;
    this.nbPointsContainer = null;
    this.meanContainer = null;
    this.maxContainer = null;
    this.minContainer = null;
    this.varianceContainer = null;
    this.chartContainer = null;

    this.createDomElement();
};

VJS.Widgets.ProbeROI.prototype.createDomElement = function() {

    // Number of voxels
    this.nbPointsContainer = document.createElement('div');
    this.nbPointsContainer.setAttribute('id', 'VJSProbeROINbPoints');

    // Mean value
    this.meanContainer = document.createElement('div');
    this.meanContainer.setAttribute('id', 'VJSProbeROIMean');

    // Max Value
    this.maxContainer = document.createElement('div');
    this.maxContainer.setAttribute('id', 'VJSProbeROIMax');

    // Min value
    this.minContainer = document.createElement('div');
    this.minContainer.setAttribute('id', 'VJSProbeROIMin');

    // Variance value
    this.varianceContainer = document.createElement('div');
    this.varianceContainer.setAttribute('id', 'VJSProbeROIVariance');

    // small trick so chart not drawn on top of it.
    this.update({});

    // Chart elements to display all info at once
    this.chartContainer = document.createElement('div');
    this.chartContainer.setAttribute('id', 'VJSProbeROIChart');
    // load empty chart
    // google.load('visualization', '1.0', {'packages':['corechart'], callback: this.drawChart.bind(this)});
    google.load('visualization', '1.1', {
        packages: ['line', 'bar'],
        callback: this.drawChart.bind(this)
    });


    this.domElement = document.createElement('div');
    this.domElement.setAttribute('id', 'VJSProbeROI');
    this.domElement.appendChild(this.nbPointsContainer);
    this.domElement.appendChild(this.meanContainer);
    this.domElement.appendChild(this.maxContainer);
    this.domElement.appendChild(this.minContainer);
    this.domElement.appendChild(this.varianceContainer);
    this.domElement.appendChild(this.chartContainer);
};

// should just pass the points and do stats here...
// but might be worst performance-wise
VJS.Widgets.ProbeROI.prototype.update = function(points) {

    // ugly
    if (JSON.stringify(points) === '{}') {
        return;
    }

    // build data to update graph!
    var mean = 0;
    var nbPoints = points.points.length;
    var max = points.max;
    var min = points.min;
    var variance = 0;

    if (!this.chart && this.chartReady) {
        // init chart
        this.options = {
            title: 'Voxels Distribution in ROI',
            vAxis: {
                title: 'Nb of Voxels'
            },
            hAxis: {
                title: 'Intensity'
            }
        };

        this.chart = new google.charts.Bar(document.getElementById('VJSProbeROIChart'));
    }

    if (this.chart) {
        // create array to contain all data
        var range = points.max - points.min + 1;
        var data = new Array(range + 1);
        data[0] = ['Intensity', 'Nb of Voxels'];
        //init data..
        for (var i = 0; i < range; i++) {
            data[i + 1] = [points.min + i, 0];
        }

        // window.console.log('I\'m in');
        //  window.console.log(points.points.length);
        for (var j = 0; j < points.points.length; j++) {
            var pData = data[points.points[j].value - points.min + 1];
            pData[1] += 1;
        }

        // might be expensive to convert here, might be better to directly create right format.
        this.data = google.visualization.arrayToDataTable(data);
        this.chart.draw(this.data, this.options);
    }

    //  if(!this.chart && this.chartReady){
    //   // init chart
    //   this.options = {
    //     title : 'Voxels Distribution in ROI',
    //     vAxis: {title: 'Nb of Voxels'},
    //     hAxis: {title: 'Intensity'},
    //     animation:{
    //       duration: 5,
    //       easing: 'out',
    //     }
    //   };

    //   this.chart = new google.charts.Bar(document.getElementById('VJSProbeROIChart'));
    // }

    // if(this.chart){
    //   // create array to contain all data
    //   var range = points.max - points.min + 1;
    //   //
    //   var data = new google.visualization.DataTable();
    //   // Add columns
    //   data.addColumn('number', 'Intensity');
    //   data.addColumn('number', 'Nb of Voxels');

    //   // Add empty rows
    //   data.addRows(range);

    //   // window.console.log('I\'m in');
    //   //  window.console.log(points.points.length);
    //   for(var i=0; i<points.points.length; i++){
    //     var index = points.points[i].value - points.min;
    //     data.setCell(index, 0, points.points[i].value);
    //     var inc  = data.getValue(index, 1);
    //     // window.console.log(inc);
    //     if(inc == null){
    //       inc = 1;
    //     }
    //     else{
    //       // window.console.log('increment...');
    //       inc += 1;
    //     }

    //     data.setCell(index, 1, inc);

    //   }

    //   this.chart.draw(data, this.options);
    // }

    var nbPointsContent = nbPoints;
    this.nbPointsContainer.innerHTML = 'Nb of voxels: ' + nbPointsContent;

    var meanContent = mean;
    this.meanContainer.innerHTML = 'Mean: ' + meanContent;

    var maxContent = max;
    this.maxContainer.innerHTML = 'Max: ' + maxContent;

    var minContent = min;
    this.minContainer.innerHTML = 'Min: ' + minContent;

    var varianceContent = variance;
    this.varianceContainer.innerHTML = 'Variance: ' + varianceContent;

};

VJS.Widgets.ProbeROI.prototype.drawChart = function() {
    this.chartReady = true;
};


// to be tested and debugged!
//http://www.jkh.me/files/tutorials/Separating%20Axis%20Theorem%20for%20Oriented%20Bounding%20Boxes.pdf
/**
 * Checks if two given bounding boxes intersect with one another.
 *
 * Results an object with the following keys:
 * @property {boolean} intersects - True if the bounding boxes intersect
 * @property    {vec3} resolution - A vector specifying the shortest distance
 * and magnitude to move the boxes such that they are no longer intersecting
 *
 * Uses the Separating Axis Theorem
 * See http://en.wikipedia.org/wiki/Hyperplane_separation_theorem)
 * Looks for separating planes between the bounding boxes.
 *
 * @param {PhysJS.util.math.BoundingBox} box1 The first bounding box
 * @param {PhysJS.util.math.BoundingBox} box2 The second bounding box
 * @returns {Object} Containers two properties, 'intersects' and 'resolution'
 */
// intersects: function (box1, box2) {
//     // assumes the position of each box to be an orthonormal basis
//     var pos1 = box1.getPosition(); // mat44
//     var pos2 = box2.getPosition(); // mat44
//     var center1 = vec4.transformMat4(vec4.create(), box1.getCenter(), pos1);
//     var center2 = vec4.transformMat4(vec4.create(), box2.getCenter(), pos2);
//     var centerDifference = vec4.subtract(vec4.create(), center2, center1);

//     var results = {
//         intersects: true,
//         resolution: null
//     };

//     // broad phase
//     var maxDiameter1 = vec4.length(vec4.subtract(vec4.create(), box1.getMax(), box1.getMin()));
//     var maxDiameter2 = vec4.length(vec4.subtract(vec4.create(), box2.getMax(), box2.getMin()));
//     if (vec4.length(centerDifference) > maxDiameter1 + maxDiameter2) {
//         results.intersects = false;
//         return results;
//     }

//     // narrow phase

//     // get the axis vectors of the first box
//     var ax1 = mat4.col(pos1, 0);
//     var ay1 = mat4.col(pos1, 1);
//     var az1 = mat4.col(pos1, 2);
//     // get the axis vectors of the second box
//     var ax2 = mat4.col(pos2, 0);
//     var ay2 = mat4.col(pos2, 1);
//     var az2 = mat4.col(pos2, 2);

//     // keep them in a list
//     var axes = [ax1, ay1, az1, ax2, ay2, az2];

//     // get the orientated radii vectors of the first box
//     var radii1 = box1.getRadii();
//     var radX1 = vec4.scale(vec4.create(), ax1, radii1[0]);
//     var radY1 = vec4.scale(vec4.create(), ay1, radii1[1]);
//     var radZ1 = vec4.scale(vec4.create(), az1, radii1[2]);

//     // get the orientated radii vectors of the second box
//     var radii2 = box2.getRadii();
//     var radX2 = vec4.scale(vec4.create(), ax2, radii2[0]);
//     var radY2 = vec4.scale(vec4.create(), ay2, radii2[1]);
//     var radZ2 = vec4.scale(vec4.create(), az2, radii2[2]);

//     var smallestDifference = Infinity;
//     // there are 15 axes to check, so loop through all of them until a separation plane is found
//     var zeros = vec4.create();
//     for (var i = 0; i < 15; i++) {
//         var axis;

//         // the first 6 axes are just the axes of each bounding box
//         if (i < 6) {
//             axis = axes[i];
//         }
//         // the last 9 axes are the cross product of all combinations of the first 6 axes
//         else {
//             var offset = i - 6;
//             var j = Math.floor(offset / 3);
//             var k = offset % 3;
//             axis = vec4.cross(vec4.create(), axes[j], axes[k + 3]);
//             if (vec4.close(axis, zeros)) {
//                 // axes must be collinear, ignore
//                 continue;
//             }
//         }

//         // get the projections of the first half box onto the axis
//         var projAx1 = Math.abs(vec4.dot(radX1, axis));
//         var projAy1 = Math.abs(vec4.dot(radY1, axis));
//         var projAz1 = Math.abs(vec4.dot(radZ1, axis));

//         // get the projections of the second half box onto the axis
//         var projAx2 = Math.abs(vec4.dot(radX2, axis));
//         var projAy2 = Math.abs(vec4.dot(radY2, axis));
//         var projAz2 = Math.abs(vec4.dot(radZ2, axis));

//         // sum the projections
//         var projectionBoxesSum = projAx1 + projAy1 + projAz1 + projAx2 + projAy2 + projAz2;

//         // get the projection of the center difference onto the axis
//         var projectionDifference = Math.abs(vec4.dot(centerDifference, axis));

//         if (projectionDifference >= projectionBoxesSum) {
//             // If the projection of the center difference onto the axis is greater
//             // than the sum of the box projections, then we found a separating plane!
//             // The bounding boxes therefore must not intersect
//             results.intersects = false;
//             break;
//         }
//         else {
//             // keep track of the difference, the smallest gives the minimum distance
//             // and direction to move the boxes such that they no longer intersect
//             var difference = projectionBoxesSum - projectionDifference;
//             if (difference < smallestDifference) {
//                 results.resolution = vec4.scale(vec4.create(), axis, difference);
//                 smallestDifference = difference;
//             }
//         }
//     }

//     if (results.intersects) {
//         // make sure the resolution vector is in the correct direction
//         var dot = vec4.dot(results.resolution, centerDifference);
//         var sign = dot ? dot < 0 ? -1 : 1 : 0;
//         vec4.scale(results.resolution, results.resolution, -sign);
//     }

//     return results;
// }
