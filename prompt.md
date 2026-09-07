# Prompt — Control Financiero

## Contexto

Desarrollar una aplicación web llamada **Control Financiero** utilizando Python y Streamlit. La aplicación debe ayudar a una persona a organizar sus ingresos, gastos, deudas y pagos pendientes mediante períodos quincenales.

El objetivo principal es que el usuario pueda conocer de forma sencilla cuánto dinero recibe, cuánto ha gastado, cuánto dinero tiene disponible y cómo está distribuyendo sus gastos.

La aplicación no debe impedir que el usuario realice gastos personales. Su función es mostrar información y alertas que le permitan tomar mejores decisiones financieras.

## Arquitectura de la interfaz

La aplicación debe tener una barra lateral de navegación con los siguientes módulos:

1. **Dashboard**
2. **Ingresos**
3. **Gastos**
4. **Deudas y pagos**
5. **Quincenas**
6. **Historial y comparación**

### Dashboard

Debe ser la pantalla principal y mostrar:

* Quincena actual.
* Total de ingresos.
* Total de gastos.
* Dinero disponible.
* Presupuesto establecido.
* Porcentaje del presupuesto utilizado.
* Estado financiero mediante una alerta visual.
* Gráfico de gastos por categoría.
* Resumen de las principales categorías de gasto.

El estado del presupuesto debe utilizar tres niveles:

* **Saludable:** el gasto se encuentra dentro de un nivel adecuado respecto al presupuesto.
* **Precaución:** el usuario está cerca de alcanzar el límite establecido.
* **Excedido:** los gastos superan el presupuesto definido.

Las alertas deben ser informativas y no deben bloquear el registro de nuevos gastos.

### Ingresos

Debe permitir registrar:

* Fuente del ingreso.
* Valor.
* Fecha.
* Período o quincena correspondiente.

También debe mostrar los ingresos registrados y permitir editarlos o eliminarlos.

### Gastos

Debe permitir registrar:

* Categoría.
* Descripción.
* Valor.
* Fecha.
* Período o quincena correspondiente.

Las categorías iniciales pueden ser:

* Alimentación.
* Servicios.
* Transporte.
* Deudas.
* Compras personales.
* Entretenimiento.
* Otros.

Debe permitir consultar, editar y eliminar gastos.

### Deudas y pagos

Debe permitir registrar obligaciones pendientes indicando:

* Concepto.
* Valor.
* Fecha límite.
* Estado.

Los estados pueden ser:

* Pendiente.
* Pagada.

También debe permitir registrar el pago de una deuda.

### Quincenas

El usuario debe poder crear o seleccionar una quincena indicando:

* Fecha inicial.
* Fecha final.
* Presupuesto disponible.

La aplicación debe asociar ingresos y gastos con cada período.

Para una quincena se debe calcular:

**Dinero disponible = Ingresos - Gastos**

También se debe calcular el porcentaje del presupuesto utilizado.

### Historial y comparación

Debe mostrar los períodos anteriores y permitir comparar dos quincenas.

La comparación debe mostrar:

* Ingresos de cada período.
* Gastos de cada período.
* Dinero disponible.
* Diferencia de gastos.
* Categorías con mayor variación.

Debe utilizar gráficos para facilitar la comparación.

## Diseño visual

La interfaz debe ser moderna, limpia y sencilla.

Utilizar una combinación de colores relacionados con las finanzas:

* Verde para valores positivos, dinero disponible y estados saludables.
* Amarillo o naranja para alertas de precaución.
* Rojo para gastos excesivos, deudas pendientes o presupuesto excedido.
* Blanco y tonos neutros como base de la interfaz.

Evitar una interfaz demasiado cargada. La información financiera importante debe ser visible rápidamente mediante tarjetas, indicadores y gráficos.

## Validaciones

La aplicación debe validar:

* Que los valores monetarios sean mayores que cero.
* Que los campos obligatorios estén completos.
* Que las fechas sean válidas.
* Que no se registren datos sin un período asociado.
* Que los valores ingresados sean numéricos.

Los mensajes de error deben ser claros y fáciles de entender.

## Persistencia

La información debe almacenarse utilizando una base de datos SQLite.

La base de datos debe conservar:

* Quincenas.
* Ingresos.
* Gastos.
* Deudas.
* Pagos.

Los datos deben permanecer disponibles después de cerrar o reiniciar la aplicación.

## Tecnologías

Utilizar:

* Python.
* Streamlit.
* SQLite.
* Pandas.
* Plotly.

La aplicación debe mantenerse sencilla, organizada y adecuada para una demostración de máximo tres minutos.

## Resultado esperado

Construir una aplicación funcional de control financiero que permita al usuario registrar sus movimientos de dinero, consultar su situación durante cada quincena, recibir alertas informativas sobre sus gastos y comparar períodos anteriores para identificar cambios en sus hábitos financieros.
