import './style.css'
import {SQLDb} from "./lib/db/sql.db";
import {sqliteTestData} from "./test/sqlite.test.data";
import {Logger} from "./lib/logger";
import {Benchmark} from "./lib/benchmark";
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div style="display: flex;flex-direction: row;">
    <div style="display: flex;flex-direction: column;width: 420px">
      <div><h1>Execute SQL</h1></div>
      <div>
        <textarea id="sql-query" rows="20" cols="50" placeholder="select * from artists"></textarea>
      </div>
      <div>
        <button id="btn-sql-run" style="width: 100%">Execute</button>  
      </div>
      <div style="padding-top: 10px;">
        <button id="btn-fill">Propagage Data</button>
        <button id="btn-clear">Clear Data</button>
      </div>
    </div>
    <div id="stats" style="padding: 20px;min-width: 300px;max-width: 300px;">
        <div id="key-stats"></div>  
        <div><pre id="time-stats" style="overflow: auto;max-height: 350px;"></pre></div>  
    </div>
    <div id="logs" style="padding: 20px;max-height: 400px;max-width: 400px;overflow: auto"></div>
</div>`

// setup test db and listeners
Logger.setElement(document.getElementById('logs'));
Benchmark.setElement(document.getElementById('time-stats'));
const dbName = 'foo'
const db = SQLDb.connect(dbName)
const keyStats = document.getElementById('key-stats')
const fillData = document.getElementById('btn-fill')
const clearData = document.getElementById('btn-clear')
const sqlRun = document.getElementById('btn-sql-run')
const txt = document.getElementById('sql-query') as HTMLTextAreaElement
const btns = [sqlRun, clearData, fillData]

const propagateStats = () => {
    keyStats.innerText = `Keys ${db.keys().length}`
}

const btnState = (disabled = false) => {
    if (disabled) {
        for(let btn of btns) {
            btn.setAttribute('disabled', 'disabled')
        }
    } else {
        for(let btn of btns) {
            btn.removeAttribute('disabled')
        }
    }
}

fillData.addEventListener('click', async () => {
    try {
        btnState(true)
        await db.execute(sqliteTestData)
        propagateStats()
    } catch (e) {
        Logger.error(e)
    } finally {
        btnState(false)
    }
})

clearData.addEventListener('click', async() => {
    btnState(true)
    try {
        Logger.debug('clear data', dbName)
        db.clear()
        propagateStats()
    } finally {
        btnState(false)
    }
})

sqlRun.addEventListener('click',  async () => {
    try {
        btnState(true)
        const res = await db.execute(txt.value);
        Logger.info('sqlRun.click', res)
        propagateStats()
    } catch (e) {
        Logger.error(e)
    } finally {
        btnState(false)
    }

})
propagateStats()
// for debug purposes
window.db = db
