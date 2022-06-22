interface Vector2D {
    x:number
    y:number
}

function vector_sum(v1:Vector2D,v2:Vector2D):Vector2D {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}
function vector_subtract(v1:Vector2D,v2:Vector2D):Vector2D {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}
function vector_scale(v:Vector2D,s:number):Vector2D {
    return {
        x: v.x * s,
        y: v.y * s
    }
}
function vector_length(v:Vector2D):number {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}
function vector_normalize(v:Vector2D):Vector2D {
    let l = vector_length(v)
    return {
        x: v.x / l,
        y: v.y / l
    }
}
function vector_distance(v1:Vector2D,v2:Vector2D):number {
    return vector_length(vector_subtract(v1,v2))
}
