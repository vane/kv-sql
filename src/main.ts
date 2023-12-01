import './style.css'
import {SQLDb} from "./lib/db/sql.db";
import {sqliteCreateTableTestData, sqliteTestData} from "./test/sqlite.test.data";
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div style="display: flex;flex-direction: column;width: 420px">
  <div><h1>Execute SQL</h1></div>
  <div>
    <textarea id="sql-query" rows="20" cols="50">
    ${sqliteCreateTableTestData}
    </textarea>
  </div>
  <div>
    <button id="sql-run" style="width: 100%">Execute</button>  
  </div>
</div>`

// setup test db and listeners
const db = SQLDb.connect('foo')
const btn = document.getElementById('sql-run');
const txt = document.getElementById('sql-query') as HTMLTextAreaElement
btn.addEventListener('click',  async () => {
    btn.setAttribute('disabled', 'disabled')
    try {
        const q = txt.value;
        await db.execute(q)
    } catch (e) {
        alert(e.message);
    } finally {
        btn.removeAttribute('disabled')
    }

});
db.execute(txt.value)
