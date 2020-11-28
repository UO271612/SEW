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
        for (var i = 0; i < this.tickers.length; i++) {
            urlCopia = this.urlDatosEmpresa.split("empresa");
            urlCopia = urlCopia[0] + this.tickers[i] + urlCopia[1];
            $.ajax({
                dataType: "json",
                url: urlCopia,
                method: 'GET',
                success: function (datos) {
                    var stringDatos = "<div class='empresa'><div class='encabezado'><h2>" + datos.data.name + " (" + datos.data.symbol + ")</h2>";
                    stringDatos += "<p class='intercambio'>Intercambio: <a href='https://" + datos.data.stock_exchange.website + "'>" + datos.data.stock_exchange.mic
                        + " (" + datos.data.stock_exchange.city + ", " + datos.data.stock_exchange.country + ")</a></p></div>";

                    $("#tickers").append(stringDatos);
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
                dataType: "json",
                url: urlCopia,
                method: 'GET',
                success: function (datos) {
                    var stringDatos = "<p><strong>Valor de cierre: " + datos.close + "</strong></p>";
                    stringDatos += "<p>Valor de apertura: " + datos.open + "</p>";
                    stringDatos += "<p>Valor máximo del día: " + datos.high + "</p>";
                    stringDatos += "<p>Valor mínimo del día: " + datos.low + "</p>";
                    stringDatos += "<p>Volumen: " + datos.volume + " miles de acciones</p>";
                    var strFecha = that.fecha.split("-")[2] + "/" + that.fecha.split("-")[1] + "/" + that.fecha.split("-")[0];
                    stringDatos += "<div class='actualizacion'><p>Actualizado a día " + strFecha + "</p></div>";

                    $("#tickers").append(stringDatos + "</div>");
                },
                error: function () {
                    alert("Se ha producido un error obteniendo la información de " + tickers[i] + ".");
                }
            });
        }

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