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
            presupuesto REAL
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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deuda_id INTEGER NOT NULL,
            valor REAL NOT NULL,
            fecha TEXT NOT NULL
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


def guardar_quincena(fecha_inicio, fecha_fin, presupuesto=None):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO quincenas (
            fecha_inicio,
            fecha_fin,
            presupuesto
        )
        VALUES (?, ?, ?)
    """, (fecha_inicio, fecha_fin, presupuesto))

    conexion.commit()
    conexion.close()


def guardar_ingreso(fuente, valor, fecha, quincena_id):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO ingresos (
            fuente,
            valor,
            fecha,
            quincena_id
        )
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


def obtener_gastos(quincena_id):
    conexion = conectar()

    datos = conexion.execute("""
        SELECT id, fecha, categoria, descripcion, valor
        FROM gastos
        WHERE quincena_id = ?
        ORDER BY fecha DESC
    """, (quincena_id,)).fetchall()

    conexion.close()

    return datos


def guardar_deuda(concepto, valor, fecha_limite):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO deudas (
            concepto,
            valor,
            fecha_limite,
            estado
        )
        VALUES (?, ?, ?, ?)
    """, (
        concepto,
        valor,
        fecha_limite,
        "Pendiente"
    ))

    conexion.commit()
    conexion.close()


def obtener_deudas():
    conexion = conectar()

    datos = conexion.execute("""
        SELECT id, concepto, valor, fecha_limite, estado
        FROM deudas
        ORDER BY fecha_limite ASC
    """).fetchall()

    conexion.close()

    return datos


def guardar_pago(deuda_id, valor, fecha):
    conexion = conectar()

    conexion.execute("""
        INSERT INTO pagos (
            deuda_id,
            valor,
            fecha
        )
        VALUES (?, ?, ?)
    """, (
        deuda_id,
        valor,
        fecha
    ))

    conexion.execute("""
        UPDATE deudas
        SET estado = 'Pagada'
        WHERE id = ?
    """, (deuda_id,))

    conexion.commit()
    conexion.close()