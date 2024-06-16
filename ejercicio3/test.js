class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    getCurrencies() {
        const urlCurrency=this.apiUrl + "/currencies";
        fetch(urlCurrency).
        then((respuesta)=>{
            if( respuesta.status >= 200 || respuesta.status < 300){
                return respuesta;
            }
            else{
                console.log(respuesta.status)
                throw Error("Ocurrio un error al intentar comunicarse a currencies");
            }
        }).then((datos)=>{
            console.log(datos.json);
        }).catch((error)=>{
            console.log(error)
        })
    }

    convertCurrency(amount, fromCurrency, toCurrency) {}
}

let monedas=new CurrencyConverter("https://api.frankfurter.app")
monedas.getCurrencies();