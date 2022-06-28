const player = {
    wave: 0,
    healthPoints: 100,
    money: 250
}

let selected_turret: Turret | null = null;

function render_top_bar(p: { wave: number, healthPoints: number, money: number }, c: CanvasRenderingContext2D) {
    c.fillStyle = "#884000"
    c.fillRect(0, 0, canvas.width, 80)
    c.fillStyle = "#ffffff"
    c.font = "50px Arial"
    c.fillText("Wave: " + p.wave, 10, 60)
    c.fillText("Health: " +Math.round(p.healthPoints), 450, 60)
    c.fillText("Money: " + Math.round(p.money) + "$", 860, 60)

}

function render_turret_upgrade(turret: Turret, c: CanvasRenderingContext2D) {
    c.fillStyle = "#845600"
    c.fillRect(900, 0, canvas.width, canvas.height)
    c.fillStyle = "#ffffff"
    c.font = "30px Arial"


    c.fillText(`${turret.type} Turret :`.toLowerCase(), 920, 130)
    c.fillText(`level: ${turret.level} > ${turret.level + 1}`.toLowerCase(), 920, 170)
    c.fillText(`Damage: ${Math.round(turret.damage * 10) / 10} > ${Math.round(turret.damage * 1.3 * 10) / 10}`.toLowerCase(), 920, 210)
    c.fillText(`Range: ${Math.round(turret.range * 10) / 10} > ${Math.round(turret.range * 1.1 * 10) / 10}`.toLowerCase(), 920, 250)
    c.fillText(`Cooldown: ${Math.round(turret.max_cooldown / 1000 * 10) / 10} > ${Math.round((turret.max_cooldown / 1000) * 0.95 * 100) / 100}`.toLowerCase(), 920, 290)
    c.fillText(`Cost: ${Math.round(turret.cost * 10) / 10} $`.toLowerCase(), 920, 330)


    c.fillStyle = (player.money >= 100) ? "gold" : "darkgray"
    c.fillRect(920, 400, 260, 100)
    c.fillStyle =(player.money >= 100) ? "orange" : "gray"
    c.font = "60px Arial"
    c.fillText(`Upgrade`.toLowerCase(), 935, 470)



}

function render_turret_placement_menu(c: CanvasRenderingContext2D) {
    c.fillStyle = "#845600"
    c.fillRect(900, 0, canvas.width, canvas.height)
    c.fillStyle = "#ffffff"
    c.font = "30px Arial"

    c.fillStyle = (player.money >= 250) ? "yellow" : "gray"
    c.fillRect(920, 100, 260, 100)
    c.fillStyle = "rgba(250,120,120,0.9)"
    c.font = "60px Arial"
    c.fillText(`circular`, 940, 170)

    c.fillStyle = (player.money >= 100) ? "yellow" : "gray"
    c.fillRect(920, 220, 260, 100)
    c.fillStyle = "rgba(250,120,120,0.9)"
    c.font = "60px Arial"
    c.fillText(`targeting`, 940, 290)

    c.fillStyle = "red"
    c.fillRect(920, 340, 260, 100)
    c.fillStyle = "white"
    c.font = "60px Arial"
    c.fillText(`cancel`, 940, 410)

    c.fillStyle = "lightgreen"
    c.fillRect(920, 460, 260, 100)
    c.fillStyle = "white"
    c.font = "60px Arial"
    c.fillText(`next`, 940, 530)

}



function select_turret(e: MouseEvent, tur: Turret[]): Turret | null {
    let rect = canvas.getBoundingClientRect()
    let pos: Vector2D = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    let y: Turret | null = turrets.sort((a, b) => vector_distance(pos, a.position) - vector_distance(pos, b.position))[0]
    if (vector_distance(pos, y.position) > 20) {
        y = null;
    }
    tur.forEach(t => t.selected = false)
    if (y != null)
        y.selected = true

    return y
}

function UpgradeTurret(t: Turret, cost: number) {
    if (player.money >= cost) {
        player.money -= cost
        t.damage *= 1.3
        t.max_cooldown *= 0.95
        t.remaining_cooldown = t.max_cooldown
        t.range *= 1.1
        t.level++
        t.cost = Math.round(t.cost * 1.3)
    }
}


function show_turret_preview(c: CanvasRenderingContext2D, pos: Vector2D) {
    c.beginPath()
    c.fillStyle = "rgba(180,180,180,0.9)"
    c.arc(pos.x, pos.y, 20, 0, Math.PI * 2)
    c.fill()
    c.closePath()
    
    c.beginPath()
    c.arc(pos.x, pos.y, 90, 0, 2 * Math.PI)
    // c.fillStyle = "rgba(0,0,0,0.3)"
    c.lineWidth = 3
    c.strokeStyle = "rgba(0,0,0,0.3)"
    c.stroke()
    c.closePath()
}

