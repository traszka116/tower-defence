const timeScale = 1000 / 30;
const canvas = document.querySelector('#can') as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D


const player = {
    wave: 1,
    healthPoints: 100
}





let path: Path =
    [
        { x: 100, y: 50 },
        { x: 300, y: 90 },
        { x: 500, y: 200 },
        { x: 600, y: 500 },
        { x: 800, y: 300 },
        { x: 900, y: 300 }
    ]



let turrets: Turret[] = []
let enemies: (Enemy | undefined)[] = []


turrets.push(create_turret({ x: 100, y: 110 }, 'purple', 70, 10))
turrets.push(create_turret({ x: 500, y: 130 }, 'purple', 70, 10))
turrets.push(create_turret({ x: 610, y: 420 }, 'purple', 70, 10))

create_enemies_over_time(create_enemy(10,5 , path, "red", 20), enemies, 5, 400)


let main_loop: NodeJS.Timer = setInterval(() => {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    draw_path(path, ctx)

    turrets.forEach(turret => {

        draw_turret(turret, ctx)
        if (turret.target == undefined || turret.target_away) {
            turret.target = find_nearest_enemy(turret, find_enemies_in_range(turret, enemies))
            turret.target_away = false
        }
        if (turret.target != undefined) {
            if (vector_distance(turret.target.position, turret.position) > turret.range) {
                turret.target_away = true

            }
            if (turret.target && !turret.target_away) {
                draw_laser(turret, turret.target, ctx)
                deal_damage(turret.target, turret.damage / timeScale)
                if (turret.target.healthPoints <= 0) {
                    turret.target = undefined
                }

            }





        }
    })


    enemies.forEach(enemy => {
        if (enemy !== undefined) {
            move_to_target(enemy)
            draw_enemy(enemy, ctx)
            if (enemy.healthPoints < 0) {
                enemies.splice(enemies.indexOf(enemy), 1)
            }

            if (vector_distance(enemy.position, enemy.path[enemy.path.length - 1]) <= 10) {
                enemies.splice(enemies.indexOf(enemy), 1)
                player.healthPoints -= enemy.damage
            }
        }


    });


}, timeScale)









