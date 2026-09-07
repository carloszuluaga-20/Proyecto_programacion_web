import streamlit as st
import pandas as pd
import plotly.express as px

from database import (
    crear_tablas,
    conectar,
    obtener_quincenas,
    guardar_quincena,
    guardar_ingreso,
    guardar_gasto,
    obtener_gastos,
    guardar_deuda,
    obtener_deudas,
    guardar_pago
)


crear_tablas()


def obtener_totales(quincena_id):
    conexion = conectar()

    ingresos = conexion.execute("""
        SELECT COALESCE(SUM(valor), 0)
        FROM ingresos
        WHERE quincena_id = ?
    """, (quincena_id,)).fetchone()[0]

    gastos = conexion.execute("""
        SELECT COALESCE(SUM(valor), 0)
        FROM gastos
        WHERE quincena_id = ?
    """, (quincena_id,)).fetchone()[0]

    conexion.close()

    return ingresos, gastos


def obtener_gastos_categoria(quincena_id):
    conexion = conectar()

    datos = conexion.execute("""
        SELECT categoria, SUM(valor)
        FROM gastos
        WHERE quincena_id = ?
        GROUP BY categoria
        ORDER BY SUM(valor) DESC
    """, (quincena_id,)).fetchall()

    conexion.close()

    return datos


st.set_page_config(
    page_title="Control Financiero",
    page_icon="💰",
    layout="wide"
)


# =========================================================
# MENÚ
# =========================================================

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


# =========================================================
# DASHBOARD
# =========================================================

if opcion == "🏠 Dashboard":

    st.title("🏠 Dashboard financiero")

    st.write(
        "Conoce cómo estás utilizando tu dinero durante cada quincena."
    )

    quincenas = obtener_quincenas()

    if not quincenas:

        st.info(
            "Primero debes crear una quincena desde 📅 Quincenas."
        )

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

        ingresos, gastos = obtener_totales(quincena_id)

        disponible = ingresos - gastos

        porcentaje = 0

        if ingresos > 0:
            porcentaje = (gastos / ingresos) * 100

        col1, col2, col3, col4 = st.columns(4)

        col1.metric(
            "💰 Ingresos",
            f"${ingresos:,.0f}"
        )

        col2.metric(
            "💸 Gastos",
            f"${gastos:,.0f}"
        )

        col3.metric(
            "💵 Disponible",
            f"${disponible:,.0f}"
        )

        col4.metric(
            "📊 Utilizado",
            f"{porcentaje:.1f}%"
        )

        st.divider()

        if ingresos == 0:

            st.info(
                "Todavía no tienes ingresos registrados."
            )

        elif gastos > ingresos:

            st.error(
                "⚠️ Has gastado más dinero del que has recibido."
            )

        elif porcentaje >= 80:

            st.warning(
                "⚠️ Ya utilizaste una parte importante de tus ingresos."
            )

        else:

            st.success(
                "✅ Tus gastos están dentro de tus ingresos."
            )

        # -------------------------------------------------
        # GRÁFICA
        # -------------------------------------------------

        st.subheader("📊 ¿En qué se está yendo tu dinero?")

        datos_categoria = obtener_gastos_categoria(quincena_id)

        if datos_categoria:

            df = pd.DataFrame(
                datos_categoria,
                columns=["Categoría", "Valor"]
            )

            fig = px.pie(
                df,
                names="Categoría",
                values="Valor",
                hole=0.4
            )

            st.plotly_chart(
                fig,
                use_container_width=True
            )

            principal = datos_categoria[0]

            st.info(
                f"💡 Tu mayor categoría de gasto es "
                f"**{principal[0]}**, con **${principal[1]:,.0f}**."
            )

        else:

            st.info(
                "Todavía no tienes gastos registrados."
            )

        # -------------------------------------------------
        # DETALLE DE GASTOS
        # -------------------------------------------------

        st.subheader("🧾 Detalle de gastos")

        gastos_detalle = obtener_gastos(quincena_id)

        if gastos_detalle:

            df_gastos = pd.DataFrame(
                gastos_detalle,
                columns=[
                    "ID",
                    "Fecha",
                    "Categoría",
                    "Descripción",
                    "Valor"
                ]
            )

            df_gastos["Valor"] = df_gastos["Valor"].apply(
                lambda x: f"${x:,.0f}"
            )

            st.dataframe(
                df_gastos,
                use_container_width=True,
                hide_index=True
            )

        else:

            st.info(
                "Aquí aparecerán todos los gastos registrados "
                "en esta quincena."
            )


# =========================================================
# INGRESOS
# =========================================================

elif opcion == "💵 Ingresos":

    st.title("💵 Ingresos")

    st.write(
        "Registra el dinero que recibes durante cada quincena."
    )

    quincenas = obtener_quincenas()

    if not quincenas:

        st.warning(
            "Primero debes crear una quincena."
        )

    else:

        opciones = {
            f"{q[1]} → {q[2]}": q[0]
            for q in quincenas
        }

        with st.form("form_ingreso"):

            fuente = st.text_input(
                "Fuente del ingreso",
                placeholder="Ejemplo: Salario"
            )

            valor = st.number_input(
                "Valor",
                min_value=0.0,
                step=1000.0
            )

            fecha = st.date_input(
                "Fecha"
            )

            seleccion = st.selectbox(
                "Quincena",
                list(opciones.keys())
            )

            guardar = st.form_submit_button(
                "Guardar ingreso"
            )

            if guardar:

                if not fuente.strip():

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
                        opciones[seleccion]
                    )

                    st.success(
                        "✅ Ingreso registrado correctamente."
                    )


# =========================================================
# GASTOS
# =========================================================

elif opcion == "🛒 Gastos":

    st.title("🛒 Gastos")

    st.write(
        "Registra cada gasto para conocer en qué estás utilizando tu dinero."
    )

    quincenas = obtener_quincenas()

    if not quincenas:

        st.warning(
            "Primero debes crear una quincena."
        )

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
                "¿En qué gastaste?",
                placeholder="Ejemplo: Almuerzo, gasolina, audífonos..."
            )

            valor = st.number_input(
                "Valor",
                min_value=0.0,
                step=1000.0
            )

            fecha = st.date_input(
                "Fecha"
            )

            seleccion = st.selectbox(
                "Quincena",
                list(opciones.keys())
            )

            guardar = st.form_submit_button(
                "Guardar gasto"
            )

            if guardar:

                if not descripcion.strip():

                    st.error(
                        "Debes indicar en qué gastaste el dinero."
                    )

                elif valor <= 0:

                    st.error(
                        "El valor debe ser mayor que cero."
                    )

                else:

                    guardar_gasto(
                        categoria,
                        descripcion,
                        valor,
                        str(fecha),
                        opciones[seleccion]
                    )

                    st.success(
                        "✅ Gasto registrado correctamente."
                    )

        # -------------------------------------------------
        # LISTA DE GASTOS
        # -------------------------------------------------

        st.divider()

        st.subheader("🧾 Gastos de esta quincena")

        seleccion_gastos = st.selectbox(
            "Ver gastos de:",
            list(opciones.keys()),
            key="ver_gastos"
        )

        gastos = obtener_gastos(
            opciones[seleccion_gastos]
        )

        if gastos:

            df_gastos = pd.DataFrame(
                gastos,
                columns=[
                    "ID",
                    "Fecha",
                    "Categoría",
                    "Descripción",
                    "Valor"
                ]
            )

            df_gastos["Valor"] = df_gastos["Valor"].apply(
                lambda x: f"${x:,.0f}"
            )

            st.dataframe(
                df_gastos,
                use_container_width=True,
                hide_index=True
            )

            total = sum(g[4] for g in gastos)

            st.metric(
                "💸 Total gastado",
                f"${total:,.0f}"
            )

        else:

            st.info(
                "Todavía no hay gastos registrados en esta quincena."
            )


# =========================================================
# DEUDAS Y PAGOS
# =========================================================

elif opcion == "💳 Deudas y pagos":

    st.title("💳 Deudas y pagos")

    st.write(
        "Registra tus deudas y lleva el control de los pagos realizados."
    )

    # -------------------------------------------------
    # REGISTRAR DEUDA
    # -------------------------------------------------

    st.subheader("➕ Registrar deuda")

    with st.form("form_deuda"):

        concepto = st.text_input(
            "Concepto",
            placeholder="Ejemplo: Tarjeta de crédito"
        )

        valor = st.number_input(
            "Valor de la deuda",
            min_value=0.0,
            step=1000.0
        )

        fecha_limite = st.date_input(
            "Fecha límite de pago"
        )

        guardar = st.form_submit_button(
            "Guardar deuda"
        )

        if guardar:

            if not concepto.strip():

                st.error(
                    "Debes ingresar el concepto de la deuda."
                )

            elif valor <= 0:

                st.error(
                    "El valor debe ser mayor que cero."
                )

            else:

                guardar_deuda(
                    concepto,
                    valor,
                    str(fecha_limite)
                )

                st.success(
                    "✅ Deuda registrada correctamente."
                )

    st.divider()

    # -------------------------------------------------
    # DEUDAS REGISTRADAS
    # -------------------------------------------------

    st.subheader("📋 Deudas registradas")

    deudas = obtener_deudas()

    if not deudas:

        st.info(
            "Todavía no tienes deudas registradas."
        )

    else:

        for deuda in deudas:

            deuda_id = deuda[0]
            concepto = deuda[1]
            valor = deuda[2]
            fecha_limite = deuda[3]
            estado = deuda[4]

            if estado == "Pendiente":

                st.warning(
                    f"🟡 **{concepto}** | "
                    f"Valor: **${valor:,.0f}** | "
                    f"Fecha límite: **{fecha_limite}**"
                )

                with st.form(
                    f"form_pago_{deuda_id}"
                ):

                    valor_pago = st.number_input(
                        "Valor del pago",
                        min_value=0.0,
                        max_value=float(valor),
                        step=1000.0,
                        key=f"pago_{deuda_id}"
                    )

                    fecha_pago = st.date_input(
                        "Fecha del pago",
                        key=f"fecha_pago_{deuda_id}"
                    )

                    registrar_pago = st.form_submit_button(
                        "Registrar pago"
                    )

                    if registrar_pago:

                        if valor_pago <= 0:

                            st.error(
                                "El valor del pago debe ser mayor que cero."
                            )

                        else:

                            guardar_pago(
                                deuda_id,
                                valor_pago,
                                str(fecha_pago)
                            )

                            st.success(
                                "✅ Pago registrado. La deuda fue marcada como pagada."
                            )

                            st.rerun()

            else:

                st.success(
                    f"🟢 **{concepto}** | "
                    f"Valor: **${valor:,.0f}** | "
                    f"Fecha límite: **{fecha_limite}** | "
                    f"**Pagada**"
                )


# =========================================================
# QUINCENAS
# =========================================================

elif opcion == "📅 Quincenas":

    st.title("📅 Quincenas")

    st.write(
        "Crea un período para organizar tus ingresos y gastos."
    )

    with st.form("form_quincena"):

        fecha_inicio = st.date_input(
            "Fecha de inicio"
        )

        fecha_fin = st.date_input(
            "Fecha de finalización"
        )

        establecer_presupuesto = st.checkbox(
            "Quiero establecer un límite de gasto para esta quincena"
        )

        presupuesto = None

        if establecer_presupuesto:

            presupuesto = st.number_input(
                "Límite de gasto",
                min_value=0.0,
                step=1000.0
            )

        guardar = st.form_submit_button(
            "Crear quincena"
        )

        if guardar:

            if fecha_fin <= fecha_inicio:

                st.error(
                    "La fecha de finalización debe ser posterior "
                    "a la fecha de inicio."
                )

            elif establecer_presupuesto and presupuesto <= 0:

                st.error(
                    "El límite de gasto debe ser mayor que cero."
                )

            else:

                guardar_quincena(
                    str(fecha_inicio),
                    str(fecha_fin),
                    presupuesto
                )

                st.success(
                    "✅ Quincena creada correctamente."
                )

    st.divider()

    st.subheader("📅 Quincenas registradas")

    quincenas = obtener_quincenas()

    if quincenas:

        for q in quincenas:

            if q[3] is not None:

                st.write(
                    f"📅 **{q[1]} → {q[2]}** | "
                    f"Límite de gasto: **${q[3]:,.0f}**"
                )

            else:

                st.write(
                    f"📅 **{q[1]} → {q[2]}** | "
                    f"Sin límite de gasto establecido"
                )

    else:

        st.info(
            "Todavía no hay quincenas registradas."
        )


# =========================================================
# HISTORIAL Y COMPARACIÓN
# =========================================================

elif opcion == "📊 Historial y comparación":

    st.title("📊 Historial y comparación")

    quincenas = obtener_quincenas()

    if not quincenas:

        st.info(
            "Todavía no hay quincenas registradas."
        )

    else:

        datos = []

        for q in quincenas:

            ingresos, gastos = obtener_totales(q[0])

            disponible = ingresos - gastos

            datos.append({
                "Quincena": f"{q[1]} → {q[2]}",
                "Ingresos": ingresos,
                "Gastos": gastos,
                "Disponible": disponible
            })

        df = pd.DataFrame(datos)

        st.subheader("📋 Resumen de quincenas")

        st.dataframe(
            df,
            use_container_width=True,
            hide_index=True
        )

        st.subheader("📈 Comparación de gastos")

        fig = px.bar(
            df,
            x="Quincena",
            y="Gastos",
            title="Gastos por quincena"
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )