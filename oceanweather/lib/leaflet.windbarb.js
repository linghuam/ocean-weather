/*
 (c) 2016, Manuel Bär (www.geonet.ch)
 Leaflet.WindBarbs, a wind barb plugin for Leaflet.
 This plugin enables the automatic creation of 
 wind barb icons in Leaflet.
 version: 0.0.1
*/

/*global L*/

(function (window, document, undefined) {
    "use strict";

    L.WindBarb = {};

    L.WindBarb.version = '0.0.1';

    L.WindBarb.Icon = L.Icon.extend({
        options: {
        	fillColor: '#2B85C7',
            pointRadius: 8,
            strokeWidth: 2,
            strokeLength: 15,
            barbSpaceing: 5,
            barbHeight: 15,
            forceDir: false
        },

        initialize: function (options) {
            options = L.Util.setOptions(this, options);
        },

        createIcon: function () {
            var div = document.createElement('div');
            var svg = this._createPoint();
            div.appendChild(svg);
            this._setIconStyles(div);
            return div;
        },

        _createPoint: function() {
            var svg, w,h, sw, r, fc;
            sw = this.options.strokeWidth, r = this.options.pointRadius, fc = this.options.fillColor;
            w = h = 2*sw+2*r;
            var xmlns = "http://www.w3.org/2000/svg";
            svg = document.createElementNS (xmlns, 'svg');
                svg.setAttributeNS (null, 'width', w);
                svg.setAttributeNS (null, 'height', h);
            var c = document.createElementNS (xmlns, 'circle');
                c.setAttributeNS (null, 'stroke', '#010101');
                c.setAttributeNS (null, 'stroke-width', sw);
                c.setAttributeNS (null, 'fill', fc);                
                c.setAttributeNS (null, 'cx', w/2);
                c.setAttributeNS (null, 'cy', h/2);
                c.setAttributeNS (null, 'r',r);
                svg.appendChild (c);
            return svg;
        },
        
        _createBarbs: function(speed) {
            var s, b, bn, bw, bh, bs, sw, sl, p, r, w, h, cx, cy, vb, xmlns, svg, g, fd;
            s = speed,
            b = {5:0,10:0,50:0}
            bs = this.options.barbSpaceing,
            bh = this.options.barbHeight,
            r = this.options.pointRadius,
            sw = this.options.strokeWidth,
            sl = this.options.strokeLength,
            fd = this.options.forceDir,
            xmlns = "http://www.w3.org/2000/svg",
            svg = document.createElementNS (xmlns, "svg"),
            g = document.createElementNS (xmlns, "g");

            // Calculate number of each stroke and add path elements to svg group

            s = (s % 5) >= 2.5 ? parseInt(s / 5) * 5 + 5 : parseInt(s / 5) * 5;
            
            for (var i = s; i >0;) {
                if(i-50>=0){
                    b[50] += 1;
                    i -= 50;
                }else if (i-10>=0){
                    b[10] += 1;
                    i -= 10;
                }else if (i-5>=0){                        
                    b[5] += 1;
                    i -= 5;
                }else{
                    break;
                }
            };
            
            // Calculate height and Width of S
            
            var bn = b[5]+b[10]+b[50];
            if(bn === 0){
                var bw = 0;
            }else{
                var bw = (bn*bs);
                if((b[5]===1 && b[10]>0)||(b[5]===1 && b[50]>0)){
                    bw -= bs;
                }
                if(b[50]>0){
                    bw += 3*b[50]*bs;
                }
            }
            
            // calculate additional padding needed
            p = Math.round(Math.sqrt(bh*bh+bw*bw))+2;

            // calculate width and height
            w = h = r*2+sw*2+2*(bw+sl)+2*p;
            vb=h-(r*2+sw*2+bh);
            
            // calculate center of circle
            cx = w/2;
            cy = h/2;                

            svg.setAttributeNS (null, "width", w);
            svg.setAttributeNS (null, "height", h);
            svg.appendChild (g);
            
            if(fd === true){
                var px, py, pt, M, H, L;
                // set the x pointer
                px = cx-r-sw*0.5,
                // set the y pointer
                py = cy,                    
                // set first M
                M = px+','+py,
                // set first h
                H = px-sl,
                // set the top x pointer
                pt = H-(2*bs);                  
            
                // draw first line
                var path = document.createElementNS (xmlns, "path");
                    path.setAttributeNS (null, 'stroke', "#000000");
                    path.setAttributeNS (null, 'stroke-width', sw);
                    path.setAttributeNS (null, 'stroke-linecap', "butt");
                    path.setAttributeNS (null, 'd', 'M '+M+' H '+H);
                g.appendChild(path);
                // update pointer
                var px = H;
            }
            
            if(bn!==0){
                if(fd !== true){
                    var px, py, pt, M, H, L;
                    // set the x pointer
                    px = cx-r-sw*0.5,
                    // set the y pointer
                    py = cy,                    
                    // set first M
                    M = px+','+py,
                    // set first h
                    H = px-sl,
                    // set the top x pointer
                    pt = H-(2*bs);                  
                
                    // draw first line
                    var path = document.createElementNS (xmlns, "path");
                        path.setAttributeNS (null, 'stroke', "#000000");
                        path.setAttributeNS (null, 'stroke-width', sw);
                        path.setAttributeNS (null, 'stroke-linecap', "butt");
                        path.setAttributeNS (null, 'd', 'M '+M+' H '+H);
                    g.appendChild(path);
                    // update pointer
                    var px = H;
                }
                
                // Check if there is a 5kn barb
                if(b[5]===1){
                    var  bl10, ang10, bl5;
                    // calculate length of 10kn barb
                    bl10 = Math.sqrt((2*bs)*(2*bs)+(bh*bh)), 
                    // calculate angle of 10kn barb
                    ang10 = Math.atan(bh/(2*bs)),
                    // calculate length of 5kn barb
                    bl5 = bl10/2;
                    // get starting point of barb
                    M = (px)+','+py, 
                    // calculate x of 5kn barb using angle of 10kn barb
                    L = ((px)-(bl5*Math.cos(ang10)))+','+(cy-bh*0.5);   
                    
                    var path = document.createElementNS (xmlns, "path");
                        path.setAttributeNS (null, 'stroke', "#000000");
                        path.setAttributeNS (null, 'stroke-width', sw);
                        path.setAttributeNS (null, 'stroke-linecap', "butt");
                        path.setAttributeNS (null, 'd', 'M '+M+' L '+L);
                    g.appendChild (path);

                    // if no other bars exist, draw little end line
                    if(b[10] == 0 && b[50] == 0){
                        px -= (bs);
                        H = px;
                        var path = document.createElementNS (xmlns, "path");
                            path.setAttributeNS (null, 'stroke', "#000000");
                            path.setAttributeNS (null, 'stroke-width', sw);
                            path.setAttributeNS (null, 'stroke-linecap', "butt");
                            path.setAttributeNS (null, 'd', 'M '+M+' H '+H);
                        g.appendChild (path);
                    }
                }  
                
                for(var i=0;i<b[10];i++){
                    M = px+','+py,
                    px -= bs,
                    H = px;
                    var path = document.createElementNS (xmlns, "path");
                        path.setAttributeNS (null, 'stroke', "#000000");
                        path.setAttributeNS (null, 'stroke-width', sw);
                        path.setAttributeNS (null, 'stroke-linecap', "butt");
                        path.setAttributeNS (null, 'd', 'M '+M+' H '+H);
                    g.appendChild (path);
                    M = H+','+cy,
                    pt -= bs,
                    L = pt+','+(cy-bh);
                    var path = document.createElementNS (xmlns, "path");
                        path.setAttributeNS (null, 'stroke', "#000000");
                        path.setAttributeNS (null, 'stroke-width', sw);
                        path.setAttributeNS (null, 'stroke-linecap', "butt");
                        path.setAttributeNS (null, 'd', 'M '+M+' L '+L);
                    g.appendChild (path);
                }
                
                if(b[50]>0){
                    M = px+','+py,
                    px -= bs,
                    H = px;
                    var path = document.createElementNS (xmlns, "path");
                        path.setAttributeNS (null, 'stroke', "#000000");
                        path.setAttributeNS (null, 'stroke-width', sw);
                        path.setAttributeNS (null, 'stroke-linecap', "butt");
                        path.setAttributeNS (null, 'd', 'M '+M+' H '+H);
                    g.appendChild (path);

                    for(var i=0;i<b[50];i++){
                        var p1,p2,p3;
                        pt -= bs,
                        p1 = px+','+cy,
                        p2 = pt+','+(cy-bh),  
                        p3 = pt+','+cy;
                        var path = document.createElementNS (xmlns, "polygon");
                            path.setAttributeNS (null, 'stroke', "#000000");
                            path.setAttributeNS (null, 'stroke-width', sw);
                            path.setAttributeNS (null, 'fill', "#000000");                                
                            path.setAttributeNS (null, 'points', p1+' '+p2+' '+p3);
                        g.appendChild (path);
                        px -= 2*bs,
                        pt -= bs;
                    }
                }    
            }
            
            return {ax: cx, ay: cy, svg: svg};
        },

        _setIconStyles: function (img, name, a) {
            var sw,r,o;
            var options = this.options,
                size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
                anchor;
                
            sw = this.options.strokeWidth,
            r = this.options.pointRadius;

            if (name === 'shadow') {
                anchor = a;
                img.style.width = anchor.x + 'px';
                img.style.height = anchor.y + 'px';
            } else {
                img.style.position = 'absolute';
                var w,h;
                w = h = 2*sw+2*r;
                var x = w/2;
                var y = h/2;
                anchor = L.point([x,y]);
            }

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            if (anchor) {
                img.style.marginLeft = (-anchor.x) + 'px';
                img.style.marginTop  = (-anchor.y) + 'px';
            }

            if (size) {
                img.style.width  = size.x + 'px';
                img.style.height = size.y + 'px';
            }
        },

        createShadow: function () {
            var d,s,b;
            d = this.options.deg+90,
            s = this.options.speed,
            b= this._createBarbs(s)
            
            var div = document.createElement('div');            
            b.svg.style.transform = "rotate("+d+"deg)";
            b.svg.style.MozTransform = "rotate("+d+"deg)";
            b.svg.style.webkitTransform = "rotate("+d+"deg)";
            b.svg.style.msTransform = "rotate("+d+"deg)";
            
            div.appendChild(b.svg);

            var anchor = {x: b['ax'], y: b['ay']};
            this._setIconStyles(div, 'shadow', anchor);
            return div;
      }
    });
        
    L.WindBarb.icon = function (options) {
        return new L.WindBarb.Icon(options);
    };

}(this, document));