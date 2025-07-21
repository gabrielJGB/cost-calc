import { h } from 'preact';
import { useState, useMemo } from 'preact/hooks';

export default function PriceCalculator() {
  const [priceList, setPriceList] = useState(0);
  const [currency, setCurrency] = useState('ARS');
  const [exchangeRate, setExchangeRate] = useState(1000);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [vatRate, setVatRate] = useState(21);
  const [marginRate, setMarginRate] = useState(50);
  const [quantity, setQuantity] = useState(1);

  // Cálculo de costo sin IVA según inclusión
  const costSinIVA = useMemo(() => {
    const vat = vatRate / 100;
    return includeVAT ? priceList / (1 + vat) : priceList;
  }, [priceList, includeVAT, vatRate]);

  // IVA y costo final
  const vatAmount = useMemo(() => costSinIVA * (vatRate / 100), [costSinIVA, vatRate]);
  const costFinal = useMemo(() => costSinIVA + vatAmount, [costSinIVA, vatAmount]);

  // Conversión a ARS
  const rate = currency === 'ARS' ? 1 : exchangeRate;
  const costSinIVAARS = costSinIVA * rate;
  const vatAmountARS = vatAmount * rate;
  const costFinalARS = costFinal * rate;

  // Cálculo de margen y precio unitario según nuevo criterio
  const marginAmountARS = costSinIVAARS * (marginRate / 100);
  const unitPriceARS = costFinalARS * (1 + marginRate / 100);
  const totalPriceARS = unitPriceARS * quantity;

  // Formateo con espacios cada 3 dígitos
  // const fmt = (val) => Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const fmt = (val) => val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ',');
  const unfmt = str => parseFloat(str.replace(/\s/g, '')) || 0;


  return (
    <div className="p-2  md:p-4 mx-auto flex flex-col justify-center md:flex-row md:gap-4 gap-4 mb-40">
      {/* Sección Costo */}
      <div className="bg-green-100 rounded-xl px-4 py-2 shadow ">
        <h2 className="text-lg font-bold mb-2">COSTO</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm md:text-md self-center">Precio Lista:</label>
          <input
            type="number"
            value={priceList}
            onInput={e => setPriceList(parseFloat(e.target.value) || 0)}
            className="rounded p-1 bg-green-200"
            // onBlur={e => setPriceList(unfmt(e.target.value))}
            // onInput={e => setPriceList(unfmt(e.target.value))}
          />
          <label className="text-sm md:text-md">Moneda:</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="text-sm rounded p-1 bg-green-200"
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
            <option value="EUR">EUR</option>
          </select>


          {currency !== 'ARS' && (
            <>
              <label className="text-sm md:text-md">Tipo de cambio:</label>
              <input
                type="number"
                value={exchangeRate}
                onInput={e => setExchangeRate(parseFloat(e.target.value) || 1)}
                className=" p-1 bg-green-200 self-center"
              />
            </>
          )}

          <label className="text-sm md:text-md self-center">IVA incluido:</label>
          <input
            type="checkbox"
            checked={includeVAT}
            onChange={e => setIncludeVAT(e.target.checked)}
            className="transform scale-100 "
          />

          <label className="text-sm md:text-md self-center">Porcentaje IVA:</label>
          <select
            value={vatRate}
            onChange={e => setVatRate(parseFloat(e.target.value))}
            className=" rounded p-1 bg-green-200"
          >
            <option value={10.5}>10.5%</option>
            <option value={21}>21%</option>
          </select>

          <label className="text-sm md:text-md">IVA (ARS):</label>
          <div className="font-mono">{fmt(vatAmountARS)}</div>

          {
            currency != "ARS" &&
            <>
              <label className="text-sm md:text-md">IVA ({currency}):</label>
              <div className="font-mono">{fmt(vatAmountARS / exchangeRate)}</div>
            </>
          }

          <label className="text-sm md:text-md">Precio sin IVA (ARS):</label>
          <div className="font-mono">{fmt(costSinIVAARS)}</div>

          <label className="font-bold text-sm md:text-md">Costo final (ARS):</label>
          <div className="font-mono font-bold">{fmt(costFinalARS)}</div>
        </div>
      </div>

      {/* Sección Venta */}
      <div className="bg-blue-100 rounded-xl px-4 py-2 shadow md:w-1/3">
        <h2 className="text-lg font-bold mb-2">VENTA</h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm md:text-md self-center">Margen (%):</label>
          <input
            type="number"
            value={marginRate}
            onInput={e => setMarginRate(parseFloat(e.target.value) || 0)}
            className="bg-blue-200 rounded p-1"
          />

          <label className="text-sm md:text-md">Margen (ARS):</label>
          <div className="font-mono">{fmt(marginAmountARS)}</div>

          <label className="text-sm md:text-md self-center">Cantidad:</label>
          <input
            type="number"
            value={quantity}
            onInput={e => setQuantity(parseInt(e.target.value) || 1)}
            className="bg-blue-200 rounded p-1"
          />

          <label className="text-sm md:text-md">Margen total (ARS):</label>
          <div className="font-mono">{fmt(marginAmountARS*quantity)}</div>

          <label className="text-sm md:text-md self-center font-bold ">Precio unidad (ARS):</label>
          <div className="font-mono font-bold ">{fmt(unitPriceARS)}</div>

          <label className="font-bold text-sm md:text-md">Precio total (ARS):</label>
          <div className="font-mono font-bold ">{fmt(totalPriceARS)}</div>
        </div>
      </div>
    </div>
  );
}
