(function(root, factory) {
    root.shaders = factory.call(root);
}(this, function() {

    
let renderMapFS = `#version 300 es
precision highp float;
in vec2 texCoord;
out vec4 outColor;

uniform sampler2D srcTex;
uniform sampler2D baseTex;
uniform vec2 center;
uniform vec2 size;
uniform vec2 dxy;
uniform vec3 marker0;
uniform vec3 marker1;

vec2 dirs[4];
void setupDirs(){
dirs[0] = vec2(-1.0,0.0);
dirs[1] = vec2(0.0,1.0);
dirs[2] = vec2(1.0,0.0);
dirs[3] = vec2(0.0,-1.0);
}

bool matches(vec3 color, vec3 marker){
    return round(255.0*color) == marker;
}

void main(){
    setupDirs();
    vec2 coord = center+size*(vec2(texCoord.x,1.0-texCoord.y)-vec2(0.5,0.5));
    if(coord.x<0.0 || coord.x>1.0 || coord.y<0.0 || coord.y>1.0){
        outColor = vec4(0.0,0.0,0.0,1.0);
    }else{
        vec4 srcColor = texture(srcTex,coord);
        outColor = srcColor;
        if(marker0 != vec3(0,0,0) || marker1 != vec3(0,0,0)){
            outColor = srcColor*0.6+vec4(1.0,1.0,1.0,1.0)*0.4;
        }
        vec4 baseColor = texture(baseTex,coord);
        if(matches(baseColor.xyz,marker0)) outColor = vec4(1.0,0.0,0.0,1.0);
        if(matches(baseColor.xyz,marker1)) outColor = vec4(0.0,1.0,0.0,1.0);
        for(int i=0; i<4; i++){
            vec2 ncoord = coord+dirs[i]*dxy;
            if(texture(baseTex,coord)!=texture(baseTex,ncoord)){
                outColor = vec4(0.0,0.0,0.0,1.0);
            }
        }
    }
}
`

return {
    renderMapFS: renderMapFS
}
}))