import sqlite3

DB_NAME = "finanzas.db"


def conectar():
    return sqlite3.connect(DB_NAME)


def crear_tablas():
    conexion = conectar()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quincenas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_inicio TEXT NOT NULL,
            fecha_fin TEXT NOT NULL,
            presupuesto REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ingresos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fuente TEXT NOT NULL,
            valor REAL NOT NULL,
            fecha TEXT NOT NULL,
            quincena_id INTEGER NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT NOT NULL,
            descripcion TEXT,
            valor REAL NOT NULL,
            fecha TEXT NOT NULL,
            quincena_id INTEGER NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS deudas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concepto TEXT NOT NULL,
            valor REAL NOT NULL,
            fecha_limite TEXT NOT NULL,
            estado TEXT NOT NULL
        )
    """)

    conexion.commit()
    conexion.close()


def obtener_quincenas():
    conexion = conectar()

    datos = conexion.execute("""
        SELECT id, fecha_inicio, fecha_fin, presupuesto
        FROM quincenas
        ORDER BY fecha_inicio DESC
    """).fetchall()

    conexion.close()

    return datos


def guardar_ingreso(fuente, valor, fecha, quincena_id):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO ingresos (fuente, valor, fecha, quincena_id)
        VALUES (?, ?, ?, ?)
    """, (fuente, valor, fecha, quincena_id))

    conexion.commit()
    conexion.close()


def guardar_gasto(categoria, descripcion, valor, fecha, quincena_id):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO gastos (
            categoria,
            descripcion,
            valor,
            fecha,
            quincena_id
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        categoria,
        descripcion,
        valor,
        fecha,
        quincena_id
    ))

    conexion.commit()
    conexion.close()