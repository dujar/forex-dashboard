import React, {
  useEffect,
  useState,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from 'react'
import axios from 'axios'
import getSymbolFromCurrency from 'currency-symbol-map'
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import moment from 'moment';

const op = {
  baseURL: 'http://localhost:8080/v1',
}
const forex = axios.create(op)
let initialBaseCurrency = 'USD'
if (localStorage && localStorage.getItem('base')) {
  initialBaseCurrency = localStorage.getItem('base')
}

function App() {
  const [options, setOptions] = useState([])
  const [base, setBase] = useState(initialBaseCurrency)
  const [isCurrencies, setCurrencies] = useState(true)
  const [isDropdownOpen, setDropdown] = useState(false)
  const [latestInfo, setLatest] = useState([])
  const [historicalData, setHistoricalData] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState(false) // if false then no currency view, else currency info
  const [day, setDay] = useState(0)

  useEffect(async () => {
    const data = await getCurrencyHistorical(base)
    setDay(0)
    setHistoricalData(data)
  }, [selectedCurrency, base])
  useEffect(() => {
    if (selectedCurrency) {
      getCurrencyHistorical(base)
    }
  }, [selectedCurrency])
  useEffect(() => {
    getLatestPrices(base).then((latestPrices) => {
      if (latestPrices) {
        setLatest(latestPrices)
      }
    })
  }, [base])
  useEffect(() => {
    getCurrencies().then((ops) => {
      if (ops) {
        setOptions(ops)
      }
    })
  }, [])
  console.log("latest info", latestInfo)
  return (
    <div className="flex flex-col justify-center">
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap">
            <div className="">Assessment</div>
            <div className="w-0 flex-1 flex items-center">
              <a
                href="#"
                onClick={() => setCurrencies(!isCurrencies)}
                className={`
                ${isCurrencies ? 'opacity-50' : ''}
                ml-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md 
                shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50`}
              >
                Currencies
              </a>
              <div className="mt-2 flex-shrink-0"></div>
              <p className="ml-3 font-medium text-white truncate">
                <span className="hidden md:inline"></span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              {/* droppy - beginning */}
              <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => {
                      setDropdown(!isDropdownOpen)
                    }}
                  >
                    Base: {base} {getUnicodeFlagIcon(base)}
                    <svg
                      className="-mr-1 ml-2 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {isDropdownOpen && options && options.length > 0 && (
                  <div
                    className=" h-40 overflow-y-auto origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                  >
                    {options.map((op, i) => {
                      return (
                        <div className="py-1" role="none" key={i}>
                          <a
                            href="#"
                            className="text-center text-gray-700 block px-4 py-2 text-sm border-2"
                            role="menuitem"
                            id="menu-item-0"
                            onClick={() => {
                              setBase(op)
                              if (localStorage) {
                                localStorage.setItem('base', op)
                              }
                            }}
                          >
                            {op} {getUnicodeFlagIcon(op)}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {/* droppy - end*/}
            </div>
          </div>
        </div>
      </div>
      <div className={'flex flex-row flex-wrap justify-start p-5'}>
        {isCurrencies &&
          latestInfo &&
          latestInfo.length > 0 &&
          latestInfo.map((c) => {
            return (
              <div
                key={c.currency_code}
                className={`
               cursor-pointer
               flex flex-row justify-around flex-wrap
               shadow-md w-64 h-16 border-purple-800 border-2 m-2 p-2
               rounded-md bg-blue-800 hover:bg-opacity-75`}
                onClick={() => {
                  setCurrencies(false)
                  setSelectedCurrency(c)
                }}
              >
                <div className="flex flex-row justify-between w-full">
                  <div className="text-white font-bold">{c.currency_code}</div>
                  <div>
                    <span className="text-white font-bold">{c.latest}</span>{' '}
                    <span className="text-white ml-1">
                      {getSymbolFromCurrency(c.currency_code)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row justify-between w-full">
                  <div className="text-white text-xs">{c.currency_name} {getUnicodeFlagIcon(c.currency_code)}</div>
                </div>
              </div>
            )
          })}
      </div>

      {!isCurrencies && selectedCurrency && historicalData && (
        <React.Fragment>
          <div className="p-2">
            <div className="text-lg font-bold">
              {selectedCurrency.currency_code}
            </div>
            <div className="font-thin">
              {selectedCurrency.currency_name}
            </div>
          </div>
          <div className={'flex flex-col  w-full p-2'}>
            <div className="mb-2 flex justify-evenly w-1/2 border-2 border-blue-50">
              <div className={`hover:bg-blue-50 cursor-pointer ${day === 0 ? 'bg-blue-50' : ''} p-2 text-lg`}>
                <a onClick={() => setDay(0)}> today </a>
              </div>
              <div className={`hover:bg-blue-50 cursor-pointer ${day === 3 ? 'bg-blue-50' : ''} p-2 text-lg`}>
                <a onClick={() => setDay(3)}> 3 days </a>
              </div>
              <div className={`hover:bg-blue-50 cursor-pointer ${day === 7 ? 'bg-blue-50' : ''} p-2 text-lg`}>
                <a onClick={() => setDay(7)}> 7 days </a>
              </div>
            </div>
            <div className="flex flex-col justify-center w-1/2 m-2">
              {historicalData
                .filter((e, i) => i <= day)
                .map((h) => {
                  return (
                    <div className="flex justify-evenly w-full border-2 border-blue-50">
                      <div>{h.date}</div>
                      <div>{h[selectedCurrency.currency_code]} {getSymbolFromCurrency(selectedCurrency.currency_code)}</div>
                    </div>
                  )
                })}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  )
}

export default App

async function getCurrencies(refresh) {
  if (!refresh && localStorage && localStorage.getItem('currencies')) {
    try {
      const currencies = JSON.parse(localStorage.getItem('currencies'))
      console.log(currencies)
      return currencies
    } catch (e) {
      return getCurrenciesfromForex()
    }
  } else {
    return getCurrenciesfromForex()
  }
}

async function getCurrenciesfromForex() {
  return await forex
    .get('/currencies')
    .then((r) => {
      const data = r.data
      const options = Object.keys(data)
      if (
        localStorage &&
        options &&
        Array.isArray(options) &&
        options.length > 0
      ) {
        // console.log(data)
        localStorage.setItem('currencies', JSON.stringify(options))
        localStorage.setItem('currenciesInfo', JSON.stringify(data))
        return options
      }
      return []
    })
    .catch((e) => {
      console.log('error:', e.message)
      return false
    })
}

async function getLatestPrices(base) {
  return await forex
    .get('/forex', { params: { base } })
    .then(async (r) => {
      const data = r.data
      console.log(data)
      const rates = data.rates
      if (localStorage && rates) {
        let latest = localStorage.getItem('latest')
        if (latest) {
          return JSON.parse(latest)
            .map((e) => {
              e.latest = rates[e.currency_code]
              return e
            })
            .filter((e) => e.latest)
        }
        let currenciesInfo = localStorage.getItem('currenciesInfo')
        if (!currenciesInfo) {
          await getCurrencies()
          currenciesInfo = localStorage.getItem('currenciesInfo')
        }
        currenciesInfo = JSON.parse(currenciesInfo)

        currenciesInfo = Object.keys(currenciesInfo)
          .map((k) => currenciesInfo[k])
          .map((e) => {
            e.latest = rates[e.currency_code]
            return e
          })
          .filter((e) => e.latest)

        localStorage.setItem('latest', JSON.stringify(currenciesInfo))
        return currenciesInfo
      }
      return []
    })
    .catch((e) => {
      console.log('error:', e.message)
      return false
    })
}

async function getCurrencyHistorical(base) {
  return forex
    .get('/latest', {
      params: {
        span: 7,
        base,
      },
    })
    .then((res) => {
      console.log(res.data)
      if (res.data) {
        const data = Object.keys(res.data).map((e) => {
          if (['base', 'span', 'today'].includes(e)) {
            return false
          } else {
            const rates = res.data[e]
            rates.date = moment(e).format('LL')
            return rates
          }
        })
        return data.filter((e) => e).map(e => { e.date = moment(e.date).format('LL'); return e })
      }
    })
    .catch((e) => {
      console.log(e)
    })
}
