
var exports = {};

var GEOM2D = {};
exports.GEOM2D = GEOM2D;

//image geometry in that funky coordinate system with upper left at 0,0

(function () {
  var lib = GEOM2D;
 
  lib.Point = function (x,y) {
    this.x = x;
    this.y = y;
  }
  
  lib.Point.prototype.length = function () {
    var x = this.x;
    var y = this.y;
    return Math.sqrt(x*x + y*y);
  }
  
  lib.Point.prototype.times = function (z) {
    return new lib.Point(z*this.x,z*this.y);
  }
  
  
  lib.Point.prototype.timesX = function (z) {
    return new lib.Point(z*this.x,this.y);
  }
  
  // divisor might be a point
  lib.Point.prototype.divideBy = function (z) {
    var x = this.x;
    var y = this.y;
    if (!z) debugger;
    if (typeof z == "number") {
      return new lib.Point(x/z,y/z);
    }
    return new lib.Point(x/(z.x),y/(z.y));
  }
  
  
  
  lib.Point.prototype.plus = function (p) {
    return new lib.Point(this.x + p.x,this.y + p.y);
  }
  
  
  lib.Point.prototype.minus = function (p) {
    if (typeof p == "undefined") {
      return new lib.Point(-this.x,-this.y);
    }
    return new lib.Point(this.x - p.x,this.y - p.y);
  }
  
  lib.Point.prototype.clone = function () {
    return new lib.Point(this.x,this.y);
  }
  
  lib.Point.prototype.externalize = function () {
    return {x:this.x,y:this.y}
  }
  
  // return this at v=0 , p1 at v = 1
  lib.Point.prototype.interpolate = function (p1,v) {
    var xd = p1.x - this.x;
    var yd = p1.y - this.y;
    return new lib.Point(this.x + v * xd,this.y + v * yd);
  }
   
    

  
  lib.internalizePoint = function (p) {
    return new lib.Point(p.x,p.y);
  }
  
  
  lib.Bounds = function (min,max) {
    this.min = min;
    this.max = max;
  }
  
  lib.Bounds.prototype.intersect = function (b) {
    var min = Math.max(this.min,b.min);
    var max = Math.min(this.max,b.max);
    if (min >= max) return null;
    return new lib.Bounds(min,max);
  }
  
  
  
  lib.Bounds.prototype.intersects = function (b) {
    var min = Math.max(this.min,b.min);
    var max = Math.min(this.max,b.max);
    return max > min;
  }
  
  lib.Rect = function (corner,extent) {
    this.corner = corner;
    this.extent = extent;
  }
  
  lib.Rect.prototype.times = function (s) {
    return new lib.Rect(this.corner.times(s),this.extent.times(s));
  }
  
  // scale the rectangle while perserving the center
  lib.Rect.prototype.scale = function (s) {
    var center = this.center();
    var cornerRelCenter = this.corner.minus(center);
    var newCorner = center.plus(cornerRelCenter.times(s));
    return new lib.Rect(newCorner,this.extent.times(s));
  }
  
  lib.Rect.prototype.contains = function (p) {
    var crn = this.corner;
    var ext = this.extent;
    var px = p.x
    var py = p.y;
    var ux = crn.x + ext.x;
    var uy = crn.y + ext.y;
    var rs = (px >= crn.x) && (px <= ux) && (py >= crn.y) && (py <= uy);
    return rs;
  }
  
  lib.Rect.prototype.expand = function (ex) {
    var crn = this.corner;
    var ext = this.extent;
    var ncrn = new lib.Point(crn.x-ex,crn.y-ex);
    var nxt = new lib.Point(ext.x+2*ex,ext.y+2*ex);
    return new lib.Rect(ncrn,nxt);
  }
  
  lib.Rect.prototype.applyPointOperation = function (f) {
    var ul = this.corner;
    var lr = this.lowerRight();
    var vul = f(ul);
    var vlr = f(lr);
    return lib.newRectFromCorners(vul,vlr);
  }
  
  lib.Rect.prototype.plus = function (p) {
    var c = this.corner;
    var nc = c.plus(p);
    return new lib.Rect(nc,this.extent);
  }


  // for firebug debuggery
  lib.Rect.prototype.tostring= function () {
    var c = this.corner;
    var ex = this.extent;
    return "[rect ("+Math.floor(c.x)+","+Math.floor(c.y)+")("+Math.floor(ex.x)+","+Math.floor(ex.y)+")]"
  }
  
  
  lib.Rect.prototype.interpolate = function (r1,v) {
    var ixt = this.extent.interpolate(r1.extent,v);
    var ic = this.corner.interpolate(r1.corner,v);
    return new lib.Rect(ic,ixt);
  }

  lib.internalizeRect = function (r) {
    return new lib.Rect(lib.internalizePoint(r.corner),lib.internalizePoint(r.extent));
  }
  
  lib.Rect.prototype.externalize = function () {
    return {corner:this.corner.externalize(),extent:this.extent.externalize()};
  }
  
  lib.Rect.prototype.clone = function () {
    return new lib.Rect(this.corner,this.extent);
  }
 
    
  lib.Rect.prototype.maxX = function () {
    return this.corner.x + this.extent.x;
  }


  lib.Rect.prototype.maxY = function () {
    return this.corner.y + this.extent.y;
  }
/*
  lib.Rect.prototype.scale = function (s) {
    return new lib.Rect(this.corner.times(s),this.extent.times(s));
  }
*/
  
  
  
  lib.Rect.prototype.area = function () {
    var ext = this.extent;
    return ext.x * ext.y;
  }
  
  lib.Rect.prototype.center = function () {
    var c = this.corner;
    var ext = this.extent;
    var cntx = c.x + 0.5 * ext.x;
    var cnty = c.y + 0.5 * ext.y;
    return new lib.Point(cntx,cnty);
  }

  lib.Rect.prototype.lowerRight = function () {
    return this.corner.plus(this.extent);
  }

  lib.Rect.prototype.yBounds = function () {
    return new lib.Bounds(this.corner.y,this.corner.y + this.extent.y);
  }  
  
  
  lib.Rect.prototype.xBounds = function () {
    return new lib.Bounds(this.corner.x,this.corner.x + this.extent.x);
  }  
  
  lib.newRectFromBounds = function (xb,yb) {
    var c = new lib.Point(xb.min,yb.min);
    var xt = new lib.Point(xb.max-xb.min,yb.max-yb.min);
    return new lib.Rect(c,xt);
  }
  
  lib.newRectFromCorners = function (ur,ll) {
    var xt = ll.minus(ur);
    return new lib.Rect(ur,xt);
  }
  
  
  lib.Rect.prototype.intersect = function (rc) {
    var xb = this.xBounds().intersect(rc.xBounds());
    if (!xb) return null;
    var yb = this.yBounds().intersect(rc.yBounds());
    if (!yb) return null;
    return lib.newRectFromBounds(xb,yb);
  }
  
  
  lib.Rect.prototype.intersects = function (rc) {
    return this.xBounds().intersects(rc.xBounds()) && this.yBounds().intersects(rc.yBounds());
  }

  lib.Grid =  function (rows,corner,extent) {
    this.rows = rows; // an array of arrays
    this.rowCount = rows.length;
    this.colCount = rows[0].length;
    var xInc = extent.x/(this.rowCount - 1);
    var yInc = extent.y/(this.colCount - 1);
    this.corner = corner;
    this.extent = extent;
    this.cellDim = new lib.Point(xInc,yInc);
  }
     // find the cell that contains this point - and return  a pair cell,withinCell, where
     // cell is xidx,yidx of the  upper left corner (using graphics Y down convention)
     // and withinCell  is x,y where 0 is left end or top, and  1 is right end, or bottom

 
  lib.Grid.prototype.inCell = function (p) {
    var rc = p.minus(this.corner);
    var cellDim = this.cellDim;
    var xidx = Math.floor(rc.x/cellDim.x);
    var yidx = Math.floor(rc.y/cellDim.y);
    var cell = new lib.Point(xidx,yidx);
    var cellDim = this.cellDim;
    var relcell = p.minus(p,new lib.Point(xidx * cellDim.x,yidx * cellDim.y));
    var normalizedRelcell = relcell.divideBy(cellDim);
    return {cell:cell,withinCell:normalizedRelcell};
  }
  
  lib.Grid.prototype.valueAtGridPoint = function (p) { // p = xidx,yidx
    var rows = this.rows;
    var row = rows[p.y];
    return row[p.x];
  }
  
  lib.Grid.prototype.valueAtPoint = function (p) {
    var cin = this.inCell(p);
    var c = cin.cell;
    var incell = cin.withinCell;
    var vp0 = this.valueAtGridPoint(c);
    var vp1 = this.valueAtGridPoint(new lib.Point(c.x+1,c.y));
    var vp2 = this.valueAtGridPoint(new lib.Point(c.x,c.y+1));
    var vp3 = this.valueAtGridPoint(new lib.Point(c.x+1,c.y+1));
    // bilinear first interpolate between vp0 and vp1, and vp2, vp3
    // then between these values.
    var incx = incell.x;
    var incy = incell.y;
    var topI = vp0 * (1-incx) + vp1 * incx;
    var bottomI = vp2 * (1-incx) + vp1 * incx;
    var rs = topI * (1-incy) + bottomI  * incy;
    return rs;
  }
    
    
  //1d
  lib.Grid1 =  function (values,lb,ub) {
    this.values = values; 
    this.count = values.length;
    this.increment = (ub-lb)/(this.count - 1);
    this.lb = lb;
    this.ub = ub;
  
  }
     // find the cell that contains this point - and return  a pair cell,withinCell, where
     // cell is xidx,yidx of the  upper left corner (using graphics Y down convention)
     // and withinCell  is x,y where 0 is left end or top, and  1 is right end, or bottom

 
  lib.Grid1.prototype.inCell = function (x) {
    var lb = this.lb;
    var r = x-lb;
    var inc = this.increment
    var idx = Math.floor(r/inc);
  
    var relcell = (r - idx*inc)/inc;
    return {cell:idx,withinCell:relcell};
  }
  
  
  lib.Grid1.prototype.valueAt = function (x) {
    var cin = this.inCell(x);
    var idx = cin.cell;
    var incell = cin.withinCell;
    var values = this.values;
    var v0 = values[idx];
    var v1 = values[idx+1];
    var rs = v1 * incell + v0 * (1-incell);
    
    return rs;
  }
    
  
  
  
  lib.scaleRect = function (rect,corner,scale) {
    var nex = rect.extent.times(scale);
    var rs = new lib.Rect(corner,nex);
    return rs;
  }
  
  
    
  
  
  lib.scaleRectX = function (rect,corner,scale) {
    var nex = rect.extent.timesX(scale);
    var rs = new lib.Rect(corner,nex);
    return rs;
  }
  
    
    
    
    
    

  

})();

