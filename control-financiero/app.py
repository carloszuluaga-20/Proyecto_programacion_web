import streamlit as st
from database import (
    crear_tablas,
    conectar,
    obtener_quincenas,
    guardar_ingreso,
    guardar_gasto
)

st.set_page_config(
    page_title="Control Financiero",
    page_icon="💰",
    layout="wide"
)

crear_tablas()


# =========================
# FUNCIONES AUXILIARES
# =========================

def obtener_totales(quincena_id):
    conexion = conectar()

    ingreso = conexion.execute(
        "SELECT COALESCE(SUM(valor), 0) FROM ingresos WHERE quincena_id = ?",
        (quincena_id,)
    ).fetchone()[0]

    gasto = conexion.execute(
        "SELECT COALESCE(SUM(valor), 0) FROM gastos WHERE quincena_id = ?",
        (quincena_id,)
    ).fetchone()[0]

    conexion.close()

    return ingreso, gasto


# =========================
# MENÚ
# =========================

st.sidebar.title("💰 Control Financiero")

opcion = st.sidebar.radio(
    "Menú",
    [
        "🏠 Dashboard",
        "💵 Ingresos",
        "🛒 Gastos",
        "💳 Deudas y pagos",
        "📅 Quincenas",
        "📊 Historial y comparación"
    ]
)


# =========================
# DASHBOARD
# =========================

if opcion == "🏠 Dashboard":

    st.title("🏠 Dashboard")
    st.write("Resumen de tu situación financiera.")

    quincenas = obtener_quincenas()

    if not quincenas:
        st.info("Primero debes crear una quincena.")
    else:
        opciones = {
            f"{q[1]} → {q[2]}": q[0]
            for q in quincenas
        }

        seleccion = st.selectbox(
            "Selecciona una quincena",
            list(opciones.keys())
        )

        quincena_id = opciones[seleccion]

        quincena = next(
            q for q in quincenas
            if q[0] == quincena_id
        )

        presupuesto = quincena[3]

        ingresos, gastos = obtener_totales(quincena_id)
        disponible = ingresos - gastos

        if presupuesto > 0:
            porcentaje = (gastos / presupuesto) * 100
        else:
            porcentaje = 0

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric(
                "Ingresos",
                f"${ingresos:,.0f}"
            )

        with col2:
            st.metric(
                "Gastos",
                f"${gastos:,.0f}"
            )

        with col3:
            st.metric(
                "Disponible",
                f"${disponible:,.0f}"
            )

        with col4:
            st.metric(
                "Presupuesto",
                f"${presupuesto:,.0f}"
            )

        st.progress(
            min(porcentaje / 100, 1.0)
        )

        st.write(
            f"Has utilizado el **{porcentaje:.1f}%** del presupuesto."
        )

        if porcentaje < 70:
            st.success("🟢 Tu nivel de gasto está saludable.")
        elif porcentaje <= 100:
            st.warning("🟡 Precaución: te estás acercando al límite.")
        else:
            st.error("🔴 Has superado el presupuesto establecido.")


# =========================
# INGRESOS
# =========================

elif opcion == "💵 Ingresos":

    st.title("💵 Ingresos")

    quincenas = obtener_quincenas()

    if not quincenas:
        st.warning("Primero debes crear una quincena.")
    else:

        opciones = {
            f"{q[1]} → {q[2]}": q[0]
            for q in quincenas
        }

        with st.form("form_ingreso"):

            fuente = st.text_input(
                "Fuente del ingreso"
            )

            valor = st.number_input(
                "Valor del ingreso",
                min_value=0.0,
                step=1000.0
            )

            fecha = st.date_input("Fecha")

            quincena = st.selectbox(
                "Quincena",
                list(opciones.keys())
            )

            guardar = st.form_submit_button(
                "Guardar ingreso"
            )

            if guardar:

                if not fuente:
                    st.error(
                        "Debes ingresar la fuente del ingreso."
                    )

                elif valor <= 0:
                    st.error(
                        "El valor debe ser mayor que cero."
                    )

                else:

                    guardar_ingreso(
                        fuente,
                        valor,
                        str(fecha),
                        opciones[quincena]
                    )

                    st.success(
                        "✅ Ingreso guardado correctamente."
                    )


# =========================
# GASTOS
# =========================

elif opcion == "🛒 Gastos":

    st.title("🛒 Gastos")

    quincenas = obtener_quincenas()

    if not quincenas:
        st.warning("Primero debes crear una quincena.")
    else:

        categorias = [
            "Alimentación",
            "Servicios",
            "Transporte",
            "Deudas",
            "Compras personales",
            "Entretenimiento",
            "Otros"
        ]

        opciones = {
            f"{q[1]} → {q[2]}": q[0]
            for q in quincenas
        }

        with st.form("form_gasto"):

            categoria = st.selectbox(
                "Categoría",
                categorias
            )

            descripcion = st.text_input(
                "Descripción"
            )

            valor = st.number_input(
                "Valor del gasto",
                min_value=0.0,
                step=1000.0
            )

            fecha = st.date_input("Fecha")

            quincena = st.selectbox(
                "Quincena",
                list(opciones.keys())
            )

            guardar = st.form_submit_button(
                "Guardar gasto"
            )

            if guardar:

                if valor <= 0:
                    st.error(
                        "El valor debe ser mayor que cero."
                    )

                else:

                    guardar_gasto(
                        categoria,
                        descripcion,
                        valor,
                        str(fecha),
                        opciones[quincena]
                    )

                    st.success(
                        "✅ Gasto guardado correctamente."
                    )


# =========================
# DEUDAS
# =========================

elif opcion == "💳 Deudas y pagos":

    st.title("💳 Deudas y pagos")

    st.write(
        "Aquí gestionaremos tus deudas y pagos pendientes."
    )

    st.info(
        "Esta sección será implementada en el siguiente paso."
    )


# =========================
# QUINCENAS
# =========================

elif opcion == "📅 Quincenas":

    st.title("📅 Quincenas")

    with st.form("form_quincena"):

        fecha_inicio = st.date_input(
            "Fecha de inicio"
        )

        fecha_fin = st.date_input(
            "Fecha de finalización"
        )

        presupuesto = st.number_input(
            "Presupuesto de la quincena",
            min_value=0.0,
            step=1000.0
        )

        crear = st.form_submit_button(
            "Crear quincena"
        )

        if crear:

            if fecha_fin <= fecha_inicio:
                st.error(
                    "La fecha final debe ser posterior "
                    "a la fecha inicial."
                )

            elif presupuesto <= 0:
                st.error(
                    "El presupuesto debe ser mayor que cero."
                )

            else:

                conexion = conectar()

                conexion.execute(
                    """
                    INSERT INTO quincenas
                    (fecha_inicio, fecha_fin, presupuesto)
                    VALUES (?, ?, ?)
                    """,
                    (
                        str(fecha_inicio),
                        str(fecha_fin),
                        presupuesto
                    )
                )

                conexion.commit()
                conexion.close()

                st.success(
                    "✅ Quincena creada correctamente."
                )

    st.subheader("Quincenas registradas")

    quincenas = obtener_quincenas()

    if quincenas:

        for q in quincenas:

            st.write(
                f"📅 **{q[1]} → {q[2]}** "
                f"| Presupuesto: **${q[3]:,.0f}**"
            )

    else:
        st.info("Todavía no hay quincenas registradas.")


# =========================
# HISTORIAL
# =========================

elif opcion == "📊 Historial y comparación":

    st.title("📊 Historial y comparación")

    quincenas = obtener_quincenas()

    if not quincenas:

        st.info(
            "Todavía no existen períodos registrados."
        )

    else:

        st.subheader("Historial de quincenas")

        for q in quincenas:

            ingresos, gastos = obtener_totales(q[0])
            disponible = ingresos - gastos

            st.write(
                f"### 📅 {q[1]} → {q[2]}"
            )

            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric(
                    "Ingresos",
                    f"${ingresos:,.0f}"
                )

            with col2:
                st.metric(
                    "Gastos",
                    f"${gastos:,.0f}"
                )

            with col3:
                st.metric(
                    "Disponible",
                    f"${disponible:,.0f}"
                )

            st.divider()