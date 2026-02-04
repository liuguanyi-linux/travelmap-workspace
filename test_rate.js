
fetch('https://open.er-api.com/v6/latest/CNY')
  .then(res => res.json())
  .then(data => {
    console.log('Status:', data.result);
    console.log('CNY to KRW:', data.rates.KRW);
  })
  .catch(err => console.error(err));
