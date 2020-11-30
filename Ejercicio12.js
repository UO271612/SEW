class MarketStackAPI {
    constructor() {
        this.apiKey = "21396f4f5699ddfc4c99c76b7402bdbb"
        this.tickers = [];
        this.periodoInicio = "";
        this.periodoFin = "";
        this.urlDatosEmpresa = "http://api.marketstack.com/v1/tickers/empresa/eod?access_key=" + this.apiKey;
        this.urlCotizacion = "http://api.marketstack.com/v1/tickers/empresa/eod/fecha?access_key=" + this.apiKey;
        this.datosCargados = false;
        this.fecha = "";
        this.stringDatos = "";
    }

    accionDatos() {
        if (!this.datosCargados) {
            this.pedirDatos();
            this.pedirFecha();
            this.cargarDatos();
        } else {
            this.recargarDatos();
        }
    }

    pedirDatos() {
        var entrada = prompt("Introduce una empresa para conocer su cotización\n(No introduzcas ningún valor cuando hayas terminado)")
        while (entrada == null || entrada.trim() !== "") {
            this.tickers.push(entrada);
            entrada = prompt("Introduce una empresa para conocer su cotización\n(No introduzcas ningún valor cuando hayas terminado)")
        }
    }

    pedirFecha() {
        var correcto = false;

        while (!correcto) {
            try {
                var entrada = prompt("Introduce una fecha (dd/MM/yyyy):")
                var datos = entrada.split("/");
                var dia = datos[0];
                var mes = datos[1];
                var año = datos[2];
                this.fecha = new Date(año, mes - 1, dia);
                var offset = this.fecha.getTimezoneOffset();
                this.fecha = new Date(this.fecha.getTime() - (offset * 60 * 1000));
                this.fecha = this.fecha.toISOString().split("T")[0];
                correcto = true;
            } catch (err) {
                alert("El formato de fecha especificado no es correcto.\nPor favor, inténtelo de nuevo.");
            }
        }
    }

    cargarDatos() {
        var urlCopia;
        $("#contenido").append("<p id='espera'>Cargando contenido... Esto puede llevar unos segundos.</p>");
        for (var i = 0; i < this.tickers.length; i++) {
            urlCopia = this.urlDatosEmpresa.split("empresa");
            urlCopia = urlCopia[0] + this.tickers[i] + urlCopia[1];
            this.contador = i;
            $("#tickers").append("<div class='empresa' id='empresa" + i + "'></div>");
            $("#empresa" + i).append("<div id='empresaS" + i + "'></div>");
            $("#empresa" + i).append("<div id='empresaI" + i + "'></div>");
            $.ajax({
                'async': false,
                dataType: "json",
                url: urlCopia,
                method: 'GET',
                success: function (datos) {
                    var i = marketStackApi.contador;
                    $("#empresaS" + i).append("<div class='encabezado'><h2>" + datos.data.name + " (" + datos.data.symbol + ")</h2>" +
                    "<p class='intercambio'>Intercambio: <a href='https://" + datos.data.stock_exchange.website + "'>" + datos.data.stock_exchange.mic
                        + " (" + datos.data.stock_exchange.city + ", " + datos.data.stock_exchange.country + ")</a></p></div>");
                },
                error: function () {
                    alert("Se ha producido un error obteniendo la información de " + tickers[i] + ".");
                }
            });

            urlCopia = this.urlCotizacion.split("empresa");
            urlCopia = urlCopia[0] + this.tickers[i] + urlCopia[1];
            urlCopia = urlCopia.replace("fecha", this.fecha);

            var that = this;

            $.ajax({
                'async': false,
                dataType: "json",
                url: urlCopia,
                method: 'GET',
                success: function (datos) {
                    var i = marketStackApi.contador;
                    var strFecha = that.fecha.split("-")[2] + "/" + that.fecha.split("-")[1] + "/" + that.fecha.split("-")[0];
                    $("#empresaI" + i).append("<div class='cuerpo' id='cuerpo" + i + "'></div>");
                    $("#cuerpo" + i).append("<p><strong>Valor de cierre: " + datos.close + "</strong></p>"
                    + "<p>Valor de apertura: " + datos.open + "</p>"
                    + "<p>Valor máximo del día: " + datos.high + "</p>"
                    + "<p>Valor mínimo del día: " + datos.low + "</p>"
                     + "<p>Volumen: " + datos.volume + " miles de acciones</p>"

                    + "<div class='actualizacion'><p>Actualizado a día " + strFecha + "</p></div>");
                },
                error: function () {
                    alert("Se ha producido un error obteniendo la información de " + tickers[i] + ".");
                }
            });
        }

        $("#espera").remove();

        this.marcarDatosCargados();
    }

    marcarDatosCargados() {
        this.datosCargados = true;
        $("document").ready(function () { $("#botonDatos").attr("value", "Volver a Cargar Datos"); });
    }

    recargarDatos() {
        $("#tickers").html("");
        this.cargarDatos();
    }

}

var marketStackApi = new MarketStackAPI();

class GestorFicheros {
    constructor() {
        this.archivos = [];
        this.cargado = false;
    }

    cargar(archivos) {
        if (!this.cargado && this.comprobarSoporteAPIFile()) {
            this.archivos = archivos;
            this.recorrerArchivos();
            this.cargado = true;
        } else {
            this.limpiarInformacion();
            this.cargar(archivos);
        }
    }

    limpiarInformacion() {
        $("#archivos").html("");
        this.cargado = false;
    }

    recorrerArchivos() {
        for (var i = 0; i < this.archivos.length; i++) {
            this.mostrarDatos(this.archivos[i], i);
        }
    }

    mostrarDatos(archivo, i) {
        var tipo = archivo.type;

        // Nuevo div para el archivo
        $("#archivos").append("<div class='archivo' id='archivo" + i + "'></div>");
        $("#archivo" + i).append("<div class='encabezado' id='encabezado" + i + "'></div>");

        // Datos del encabezado
        $("#encabezado" + i).append("<h2>" + archivo.name + "</h2>");
        $("#encabezado" + i).append("<p>" + "Tipo: " + tipo + "</p>");
        $("#encabezado" + i).append("</div>");

        // Información detallada
        $("#archivo" + i).append("<p>Tamaño: " + archivo.size + " bytes");
        $("#archivo" + i).append("<p>Última modificación: " + archivo.lastModifiedDate.toLocaleDateString("es-ES") + "</p>");

        // Mostrar contenido para TXT, JSON y XML
        if (tipo == "text/plain" || tipo == "application/json" || tipo == "text/xml") {
            $("#archivo" + i).append("<div class='contenido' id='contenido" + i + "'></div>");
            $("#contenido" + i).append("<p>Contenido:</p>");
            $("#contenido" + i).append("<pre class='texto' id='texto" + i + "'></p>");

            var lector = new FileReader();
            lector.onload = function(e) {
                $("#texto" + i).append(document.createTextNode(lector.result));
            }

            lector.readAsText(archivo);
        }
    }

    comprobarSoporteAPIFile() {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            this.escribirNoSoportaAPI();
            return false;
        }

        return true;
    }

    escribirNoSoportaAPI() {
        $("#archivos").append("<p>Tu navegador no soporta la API File de HTML5.</p>")
    }
}

var gestorFicheros = new GestorFicheros();