import { h } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';

export default function PriceCalculator() {
  const [priceList, setPriceList] = useState(0);
  const [currency, setCurrency] = useState('ARS');
  const [exchangeRate, setExchangeRate] = useState(1000);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [vatRate, setVatRate] = useState(21);
  const [marginRate, setMarginRate] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState("");
  const [discount, setDiscount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [entryName, setEntryName] = useState('');
  const [savedList, setSavedList] = useState(() => {
    return JSON.parse(localStorage.getItem('savedPrices') || '[]');
  });


  const priceWithDiscount = useMemo(() => {
    return priceList * (1 - discount / 100);
  }, [priceList, discount]);

  const costSinIVA = useMemo(() => {
    const vat = vatRate / 100;
    return includeVAT ? priceWithDiscount / (1 + vat) : priceWithDiscount;
  }, [priceWithDiscount, includeVAT, vatRate]);



  const vatAmount = useMemo(() => costSinIVA * (vatRate / 100), [costSinIVA, vatRate]);
  const costFinal = useMemo(() => costSinIVA + vatAmount, [costSinIVA, vatAmount]);

  const rate = currency === 'ARS' ? 1 : exchangeRate;
  const costSinIVAARS = costSinIVA * rate;
  const vatAmountARS = vatAmount * rate;
  const costFinalARS = costFinal * rate;
  const marginAmountARS = costSinIVAARS * (marginRate / 100);
  const unitPriceARS = costFinalARS * (1 + marginRate / 100);
  const totalPriceARS = unitPriceARS * quantity;




  const fmt = (val) => val.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/,/g, ',');

  const handleSave = () => {
    const newEntry = {
      nombre: entryName || '(Sin nombre)',
      producto: item,
      precioLista: priceList,
      moneda: currency,
      margen: marginRate,
      cantidad: quantity,
      includeVAT: includeVAT,
      exchangeRate: exchangeRate,
      discount: discount,
      vatRate: vatRate,
      fechaGuardado: new Date().toLocaleString()
    };
    const updated = [...savedList, newEntry];
    setSavedList(updated);
    localStorage.setItem('savedPrices', JSON.stringify(updated));
    setEntryName('');
    alert('Guardado!');
  };


  const handleLoad = (entry) => {
    setItem(entry.producto);
    setPriceList(entry.precioLista);
    setCurrency(entry.moneda);
    setMarginRate(entry.margen);
    setQuantity(entry.cantidad);
    setVatRate(entry.vatRate);
    setExchangeRate(entry.exchangeRate)
    setDiscount(entry.discount)
    setModalOpen(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(savedList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guardados.json';
    a.click();
    URL.revokeObjectURL(url);
  };



  const handleDelete = (index) => {
    const updated = [...savedList];
    updated.splice(index, 1);
    setSavedList(updated);
    localStorage.setItem('savedPrices', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro que querés borrar todos los guardados?')) {
      setSavedList([]);
      localStorage.removeItem('savedPrices');
    }
  };


  return (
    <div className="p-2 md:p-4 mx-auto flex flex-col justify-center md:flex-row md:gap-4 gap-4 mb-40">

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[rgb(0,0,0,0.9)] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-black p-4 rounded-lg w-[90%] max-w-md max-h-[90%] overflow-auto">
            <h2 className="text-lg font-bold mb-4">Guardados</h2>

            {savedList.length === 0 ? (
              <p className="text-center text-gray-600">No hay elementos guardados.</p>
            ) : (
              <ul className="space-y-2">
                {savedList.map((entry, idx) => (
                  <li key={idx} className="flex flex-row gap-2  justify-between ">
                    <div className="flex flex-1 rounded px-2  flex-col bg-slate-800 hover:bg-slate-700 cursor-pointer  justify-between gap-1" onClick={(e) => {
                      handleLoad(entry)
                      e.preventDefault()
                    }} >
                      <div className="font-semibold text-sm">{entry.nombre}</div>
                      <div className="text-xs mb-1 text-gray-400">Guardado: {entry.fechaGuardado}</div>

                      {/* <button
                        className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => handleLoad(entry)}
                      >
                      Cargar
                      </button> */}
                    </div>
                    <button
                      className="cursor-pointer  px-2 py-1 hover:bg-red-500 bg-red-600 text-white rounded text-sm"
                      onClick={(e) => {
                        handleDelete(idx)
                        e.preventDefault()

                      }}
                    >
                      Borrar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between items-center mt-6">
              {savedList.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={handleExport} className="px-3 py-1 cursor-pointer transition-all  bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm">
                    Exportar JSON
                  </button>
                  <button onClick={handleClearAll} className="px-3 py-1 cursor-pointer transition-all  bg-red-700 hover:bg-red-600 text-white rounded text-sm">
                    Borrar todos
                  </button>
                </div>
              )}
              <button onClick={() => setModalOpen(false)} className="px-3 py-1  hover:bg-gray-500 cursor-pointer transition-all bg-gray-600 text-sm text-white rounded">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}




      {/* Sección COSTO */}
      <div className="bg-[#0c4b2d] rounded-xl md:w-1/3 px-4 py-2 shadow shadow-gray-900">
        <h2 className="text-lg font-bold mb-2">COSTO</h2>
        <div className="grid grid-cols-2 gap-3">
          <textarea
            placeholder='Descripcion'
            value={item}
            onInput={e => setItem(e.target.value)}
            className='col-span-2 text-xs p-2 bg-[#0f5e38] rounded'
          />

          <label className="text-sm self-center">Precio Lista:</label>
          <input
            type="number"
            value={priceList}
            onInput={e => setPriceList(parseFloat(e.target.value) || 0)}
            className="rounded p-1 bg-[#0f5e38]"
          />
          <label className="text-sm">Moneda:</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="text-sm rounded p-1 bg-[#0f5e38]"
          >
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
            <option value="EUR">EUR</option>
          </select>

          {currency !== 'ARS' && (
            <>
              <label className="text-sm">Tipo de cambio:</label>
              <input
                type="number"
                value={exchangeRate}
                onInput={e => setExchangeRate(parseFloat(e.target.value) || 1)}
                className="p-1 bg-[#0f5e38] self-center"
              />
            </>
          )}

          <label className="text-sm self-center">Descuento (%):</label>
          <input
            type="number"
            value={discount}
            onInput={e => setDiscount(parseFloat(e.target.value) || 0)}
            className="p-1 bg-[#0f5e38] self-center rounded"
          />

          {
            discount != 0 &&
            <>
              <label className="text-sm self-center">Precio con desc ({currency}):</label>
              <div className="font-mono">{fmt(priceWithDiscount)}</div>
            </>
          }

          {
            currency != "ARS" && discount != 0 &&
            <>
              <label className="text-sm self-center">Precio desc (ARS):</label>
              <div className="font-mono">{fmt(priceWithDiscount * exchangeRate)}</div>
            </>

          }


          <label className="text-sm self-center">IVA incluido:</label>
          <input
            type="checkbox"
            checked={includeVAT}
            onChange={e => setIncludeVAT(e.target.checked)}
            className="transform scale-100"
          />

          <label className="text-sm self-center">Porcentaje IVA:</label>
          <select
            value={vatRate}
            onChange={e => setVatRate(parseFloat(e.target.value))}
            className="rounded p-1 bg-[#0f5e38]"
          >
            <option value={10.5}>10.5%</option>
            <option value={21}>21%</option>
          </select>

          <label className="text-sm">IVA (ARS):</label>
          <div className="font-mono">{fmt(vatAmountARS)}</div>

          {
            currency !== "ARS" && (
              <>
                <label className="text-sm">IVA ({currency}):</label>
                <div className="font-mono">{fmt(vatAmountARS / exchangeRate)}</div>
              </>
            )
          }

          <label className="text-sm">Precio sin IVA (ARS):</label>
          <div className="font-mono">{fmt(costSinIVAARS)}</div>

          <label className="text-sm">Costo unidad (ARS):</label>
          <div className="font-mono ">{fmt(costFinalARS)}</div>


          <label className="font-bold text-lg">Costo x{quantity} (ARS):</label>
          <div className="font-mono text-lg font-bold">{fmt(costFinalARS * quantity)}</div>

        </div>
      </div>

      {/* Sección VENTA */}
      <div className="bg-[#21387d] rounded-xl px-4 py-2  shadow md:w-1/3  shadow-gray-900">
        <h2 className="text-lg font-bold mb-2">VENTA</h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm self-center">Margen unidad (%):</label>

          <div className='flex flex-row items-center gap-1'>
            <button onClick={() => { setMarginRate(prev => prev > 0 ? prev - 1 : 0) }} className='cursor-pointer hover:bg-[#266fdb] bg-[#255bab] flex-1 py-1 px-2 font-semibold rounded'>-</button>

            <input
              type="number"
              value={marginRate}
              onInput={e => setMarginRate(parseFloat(e.target.value) || 0)}
              className="bg-[#2543ab] rounded p-1 w-[70px] text-center"
            />
            <button onClick={() => { setMarginRate(prev => prev + 1) }} className='cursor-pointer hover:bg-[#266fdb] bg-[#255bab] py-1 px-2 font-semibold flex-1 rounded'>+</button>
          </div>


          <label className="text-sm">Margen unidad (ARS):</label>
          <div className="font-mono">{fmt(marginAmountARS)}</div>

          <label className="text-sm self-center">Cantidad:</label>

          <div className='flex flex-row items-center gap-1'>
            <button onClick={() => { setQuantity(prev => (prev > 1) ? prev - 1 : 1) }} className='cursor-pointer bg-[#255bab] hover:bg-[#266fdb] flex-1 py-1 px-2 font-semibold rounded'>-</button>
            <input
              type="number"
              value={quantity}
              onInput={e => setQuantity(parseInt(e.target.value) || 1)}
              className="bg-[#2543ab] rounded p-1 w-[70px] text-center"
            />
            <button onClick={() => { setQuantity(prev => prev + 1) }} className='cursor-pointer bg-[#255bab] hover:bg-[#266fdb] py-1 px-2 font-semibold flex-1 rounded'>+</button>
          </div>

          <label className="text-sm">Margen total (ARS):</label>
          <div className="font-mono">{fmt(marginAmountARS * quantity)}</div>

          <label className="text-sm self-center">Precio unidad (ARS):</label>
          <div className="font-mono ">{fmt(unitPriceARS)}</div>

          <label className="font-bold text-lg ">Precio x{quantity} (ARS):</label>
          <div className="font-mono text-lg font-bold">{fmt(totalPriceARS)}</div>

        </div>
      </div>

      <div className="md:fixed md:bottom-2 md: left-2 flex flex-wrap gap-2 items-center  px-2 py-1 rounded">
        <input
          type="text"
          value={entryName}
          onInput={(e) => setEntryName(e.target.value)}
          placeholder="Guardar como"
          className="px-2 py-2 rounded text-sm bg-gray-700 text-white"
        />
        <button onClick={handleSave} className="px-3 py-1 flex-1 bg-green-700 hover:bg-green-600 cursor-pointer transition-all text-white rounded">Guardar</button>
        <button onClick={() => setModalOpen(true)} className="px-3 py-1 flex-1 bg-blue-700 hover:bg-blue-600 cursor-pointer transition-all  text-white rounded w-60">Ver guardados</button>
      </div>


    </div>
  );
}
