class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async getCurrencies() {

        const urlCurrency=this.apiUrl + "/currencies";
        try{
            let respuesta = await fetch(urlCurrency);
             if(respuesta.status >= 200 && respuesta.status < 300){
                let datos = await respuesta.json();
                this.#cargarCurrencies(datos);
            }
            else{
                throw Error("Ocurrio un error al intentar comunicarse a currencies");
            }
            
        }
        catch (error){
            console.log(error)
        }   
    }
    #cargarCurrencies(currencies){
        Object.keys(currencies).forEach((key)=>{
            this.currencies.push(new Currency(key,currencies[key]));
        })
    }
    async #respuestaCambioMoneda(ruta){
        let respuesta = await fetch(ruta);
        try{

            if( respuesta.status >= 200 && respuesta.status < 300 ){
                let cambioData= await respuesta.json();
                console.log(cambioData)
                return cambioData;
            }                
            else{
                throw Error("Ocurrio un error al intentar comunicarse al endpoint");
            }

        }
        catch (error){
            console.log(error);
            return null;
        }

       
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        let codigofromCurrency = fromCurrency.code;
        let codigoToCurrency = toCurrency.code;
        let ruta = this.apiUrl + "/latest";
        let cambioMoneda;
        if(codigofromCurrency === codigoToCurrency){
            return Number(amount);
        }
        else{
            ruta += `?amount=${amount}&from=${codigofromCurrency}&to=${codigoToCurrency}`;
            cambioMoneda = await this.#respuestaCambioMoneda(ruta);
            return cambioMoneda.rates[codigoToCurrency];
        }
    }
    static #convertirFecha(fecha){
        if(fecha<10){
            return "0" + fecha
        }
    }
    static #formatearFecha(fecha){
        console.log(fecha)
        return `${fecha.getFullYear()}-${CurrencyConverter.#convertirFecha(fecha.getMonth())}-${CurrencyConverter.#convertirFecha(fecha.getDate())}`;
    }
    async diferenciaEntreCambios(fromCurrency, toCurrency){
        let fecha = new Date();
        let fechaActual = CurrencyConverter.#formatearFecha(fecha);
        let fechaAnterior = CurrencyConverter.#formatearFecha(new Date(fecha.setDate(fecha.getDate() - 1)));
        if(fromCurrency.code !== toCurrency.code){
            let urlPeticion = `${this.apiUrl}/${fechaAnterior}..${fechaActual}?from=${fromCurrency.code}&to=${toCurrency.code}`;
                            console.log(urlPeticion)
            let respuestaCambio = await this.#respuestaCambioMoneda(urlPeticion);
            console.log(respuestaCambio.rates[fechaAnterior][toCurrency.code]);
            return respuestaCambio.rates[fechaAnterior][toCurrency.code] - respuestaCambio.rates[fechaActual][toCurrency.code];
        }
        else{
            return 0;
        }
        
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );
        
        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );
        //Agregue mas codigo aqui para que la diferencia de cambio se pueda ver en el DOM
        const diferenciaCambio = await converter.diferenciaEntreCambios(fromCurrency,toCurrency);
        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code},
             la diferencia de cambio respecto ayer es ${diferenciaCambio}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
