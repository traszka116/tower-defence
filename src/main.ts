const tickSpeed = 1000 / 30;
const canvas = document.querySelector('#can') as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

type modes = "placement" | "game"

let path: Path = [{ x: 100, y: 100 }, { x: 300, y: 140 }, { x: 500, y: 250 }, { x: 600, y: 550 }, { x: 800, y: 350 }, { x: 300, y: 350 }]
let enemies: Enemy[] = []
let turrets: Turret[] = []

let turret_preview = {
    x: -150,
    y: -150,
}

// turrets.push(create_circular_turret({ x: 620, y: 430 }, "orange", 90, 15, 1000, 100))
// turrets.push(create_targeting_turret({ x: 590, y: 280 }, "gold", 90, 5, 200, 100))

let loop: NodeJS.Timer = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw_path(path, ctx)



    turrets.forEach(t => {

        if (t.type == "targeting") {
            const tt: TargetingTurret = t as TargetingTurret
            if (tt.target != undefined && tt.target?.healthPoints <= 0)
                tt.target = null
            if (tt.target == null || is_target_to_far(tt))
                lock_on_target(tt, enemies)
            if (tt.target != null)
                draw_laser(tt, ctx)
            if (t.remaining_cooldown <= 0) {
                if (tt.target != null) {
                    deal_damage(tt.target, tt.damage)
                    t.remaining_cooldown = t.max_cooldown
                }
            }
            if (t.remaining_cooldown > 0)
                t.remaining_cooldown -= tickSpeed
        }
        if (t.type == "circular") {

            let tc = t as CircularTurret

            ctx.beginPath()
            ctx.fillStyle = `rgba(250,120,120,0.9)`
            ctx.arc(tc.position.x, tc.position.y, tc.burstRadius, 0, 2 * Math.PI)
            ctx.fill()
            ctx.closePath()

            if (t.remaining_cooldown <= 0) {
                let t_ene: Enemy[] = find_enemies_in_range(t, enemies)
                if (t_ene.length > 0) {
                    draw_burst(t as CircularTurret)
                    t_ene.forEach(en => {
                        deal_damage(en, t.damage)
                    })
                    t.remaining_cooldown = t.max_cooldown
                }
            }

            if (t.remaining_cooldown > 0)
                t.remaining_cooldown -= tickSpeed
        }




        draw_turret(t, ctx)
    })

    enemies.forEach(e => {
        move_to_target(e)
        draw_enemy(e, ctx)
        if (e.healthPoints <= 0) {
            player.money += e.value * player.wave
            enemies.splice(enemies.indexOf(e), 1)

        }
        if (vector_distance(e.position, e.path[e.path.length - 1]) < 10) {
            player.healthPoints -= e.damage
            enemies.splice(enemies.indexOf(e), 1)
        }

    })

    if (selected_turret)
        render_turret_upgrade(selected_turret, ctx)
    else
        render_turret_placement_menu(ctx)




    render_top_bar(player, ctx)

    show_turret_preview(ctx, turret_preview)

    if (player.healthPoints <= 0) {
        clearInterval(loop)
        // show game over screen
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "red"
        ctx.font = "50px Arial"
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2)
        // add onclick event to canvas to reload the page
        canvas.addEventListener("click", () => {
            location.reload()
        });
    }


}, tickSpeed)


let mode: modes = "game";
let toPlace: string = "";

canvas.addEventListener('click', (e: MouseEvent) => {
    let rect = canvas.getBoundingClientRect()
    let pos = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    // cursor in game
    if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600 && mode == "game") {
        selected_turret = select_turret(e, turrets)
    }

    // cursor on upgrade button
    if (selected_turret != null) {
        if (pos.x >= 920 && pos.x <= 920 + 260 && pos.y >= 400 && pos.y <= 400 + 100) {
            UpgradeTurret(selected_turret, selected_turret.cost)
        }
    }



    if (selected_turret == null) {
        console.log(pos)
        if (pos.x >= 920 && pos.x <= 920 + 260) {
            if (pos.y >= 100 && pos.y <= 200 && player.money >= 250) {
                toPlace = "circular"
                mode = "placement"
                console.log("placing turret")
            }

            if (pos.y >= 220 && pos.y <= 360 && player.money >= 100) {
                toPlace = "targeting"
                mode = "placement"
                console.log("placing turret")
            }

            if (pos.y >= 340 && pos.y <= 440) {
                toPlace = ""
                mode = "game"
                console.log("canceled")
            }


        }



    }

    if (mode == "placement") {
        if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600) {

            if (toPlace == "circular") {
                turrets.push(create_circular_turret(pos, "orange", 90, 15, 1000, 100))
                player.money -= 250
            }

            if (toPlace == "targeting") {
                turrets.push(create_targeting_turret(pos, "gold", 90, 5, 200, 100))
                player.money -= 100
            }
            turret_preview = { x: -150, y: -150 }
            mode = "game"
        }
    }

    if (pos.y >= 460 && pos.y <= 560 && pos.x >= 920 && pos.x <= 920 + 260) {
        if (enemies.length == 0) {
            toPlace = ""
            mode = "game"
            console.log("started")
            player.wave += 1
            create_enemies_over_time(create_enemy(5*player.wave*Math.log2(player.wave)+1,10*Math.sqrt(player.wave)/2,path, "red", Math.abs(2*player.wave - 3), 5), enemies, 10, 400)
        }
    }

})


canvas.addEventListener('mousemove', (e: MouseEvent) => {
    let rect = canvas.getBoundingClientRect()
    let pos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    if (mode == "placement") {
        if (pos.x >= 0 && pos.x <= 920 && pos.y >= 80 && pos.y <= 600) {
            turret_preview = pos
        }
        else
            turret_preview = { x: -150, y: -150 }
    }

})














