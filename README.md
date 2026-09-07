# Control Financiero

## 1. Necesidad identificada

Muchas personas reciben ingresos de manera mensual o quincenal, pero tienen dificultades para organizar su dinero y saber cuánto pueden gastar realmente. Los gastos cotidianos, las obligaciones pendientes y las deudas pueden acumularse sin que exista una visión clara de la situación financiera. La aplicación busca facilitar el control de ingresos, gastos, deudas y pagos, mostrando cuánto dinero se ha utilizado y cuánto queda disponible durante cada quincena. Su objetivo no es impedir los gastos personales, sino ayudar al usuario a tomar decisiones más conscientes y evitar que los gastos innecesarios terminen generando problemas de endeudamiento.

## 2. Usuario objetivo

La aplicación está dirigida a personas que reciben ingresos de forma mensual o quincenal y necesitan organizar mejor su dinero. Está pensada para usuarios que desean conocer cuánto reciben, cuánto gastan, qué obligaciones tienen pendientes y cuánto dinero les queda disponible en cada período.

## 3. Tarea o decisión que se desea mejorar

La aplicación busca facilitar la decisión de cuánto dinero puede gastar una persona durante cada quincena, teniendo en cuenta sus ingresos, gastos, deudas y pagos pendientes. También permitirá comparar diferentes períodos para identificar cambios en los hábitos de gasto y tomar mejores decisiones financieras.

## 4. Objetivo

Desarrollar una aplicación web sencilla que permita registrar y organizar los ingresos, gastos, deudas y pagos de una persona, utilizando períodos quincenales para mostrar de manera clara cuánto dinero ha recibido, cuánto ha gastado y cuánto tiene disponible.

## 5. Requisitos funcionales

### RF01. Registro de ingresos

El sistema debe permitir registrar ingresos indicando el valor, la fecha y la fuente del ingreso.

### RF02. Registro de gastos

El sistema debe permitir registrar gastos indicando el valor, la fecha, la categoría y una descripción.

### RF03. Gestión de categorías

El sistema debe permitir clasificar los gastos en categorías como alimentación, servicios, deudas, transporte, compras personales y otros.

### RF04. Gestión de deudas y pagos pendientes

El sistema debe permitir registrar deudas u obligaciones pendientes, indicando el valor, el concepto y la fecha límite de pago.

### RF05. Control por quincenas

El sistema debe organizar los ingresos y gastos de acuerdo con períodos quincenales para conocer el comportamiento financiero durante cada período.

### RF06. Cálculo del dinero disponible

El sistema debe calcular automáticamente el dinero disponible restando los gastos y pagos registrados a los ingresos del período seleccionado.

### RF07. Presupuesto quincenal

El usuario debe poder establecer un límite de gasto para una quincena y consultar cuánto presupuesto le queda disponible.

### RF08. Visualización de información financiera

El sistema debe mostrar indicadores y gráficos que permitan visualizar ingresos, gastos, dinero disponible y distribución de gastos por categoría.

### RF09. Historial financiero

El sistema debe conservar la información de períodos anteriores para que el usuario pueda consultar su historial.

### RF10. Comparación de períodos

El sistema debe permitir comparar períodos para identificar aumentos o disminuciones en los gastos y conocer cómo han cambiado los hábitos financieros.

## 6. Requisitos no funcionales

### RNF01. Usabilidad

La aplicación debe contar con una interfaz sencilla e intuitiva para que una persona pueda registrar y consultar su información financiera sin conocimientos técnicos.

### RNF02. Persistencia

La información registrada debe conservarse aunque la aplicación se cierre o se reinicie.

### RNF03. Validación

El sistema debe validar los datos ingresados para evitar valores incorrectos, campos obligatorios vacíos o montos negativos cuando no correspondan.

### RNF04. Rendimiento

Las operaciones principales de registro, consulta y cálculo deben ejecutarse de manera rápida para el usuario.

### RNF05. Compatibilidad

La aplicación debe poder utilizarse desde un navegador web en computadores y dispositivos con acceso a Internet.

## 7. Descripción de la solución

La aplicación contará con un panel principal donde el usuario podrá consultar el estado de sus finanzas durante la quincena actual. Se mostrarán los ingresos registrados, los gastos realizados, el dinero disponible y el porcentaje del presupuesto utilizado.

También contará con módulos para registrar ingresos y gastos, gestionar deudas y pagos pendientes, consultar períodos anteriores y comparar el comportamiento financiero entre diferentes quincenas.

La aplicación no bloqueará los gastos del usuario. Su función será proporcionar información clara y alertas para que pueda identificar cuándo está gastando demasiado y tomar decisiones antes de comprometer su capacidad de pago.

## 8. Tecnologías

* Python
* Streamlit
* SQLite
* Pandas
* Plotly
* Git y GitHub

## 9. Persistencia

La aplicación utilizará una base de datos SQLite para almacenar los ingresos, gastos, deudas, pagos y períodos financieros. Esto permitirá conservar la información y consultar el historial de períodos anteriores.

## 10. Despliegue

La aplicación será desplegada utilizando Streamlit Community Cloud para permitir su acceso desde un navegador web.

## 11. Equipo

Proyecto desarrollado como parte del reto final de la asignatura de Programación Web.
