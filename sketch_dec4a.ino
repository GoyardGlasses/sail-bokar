#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);

// ---------- HTML with wagon + MULTI-product presets ----------
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rake Load Calculator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #f5f5f5;
      --card-bg: #ffffff;
      --accent: #ffcc00;
      --accent-dark: #222222;
      --text: #111111;
      --danger: #ff3366;
    }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
    body {
      background: var(--bg);
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    .card {
      max-width: 520px;
      width: 100%;
      background: var(--card-bg);
      border: 3px solid #000;
      box-shadow: 6px 6px 0 #000;
      padding: 20px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 16px 0;
      padding: 8px 10px;
      background: var(--accent);
      border: 2px solid #000;
      display: inline-block;
    }
    h2 {
      font-size: 14px;
      margin: 12px 0 6px 0;
      padding: 4px 6px;
      border: 2px solid #000;
      display: inline-block;
      background: #eaeaea;
    }
    h3 {
      font-size: 13px;
      margin: 8px 0 4px 0;
      padding: 3px 5px;
      border-left: 3px solid #000;
      background: #f0f0f0;
    }
    label {
      font-weight: 600;
      font-size: 13px;
      display: block;
      margin-bottom: 4px;
    }
    input, select {
      width: 100%;
      padding: 8px 10px;
      margin-bottom: 8px;
      border: 2px solid #000;
      outline: none;
      font-size: 14px;
      background: #fafafa;
    }
    input:focus, select:focus {
      background: #fffbe6;
    }
    input[readonly] {
      background: #f0f0f0;
      cursor: not-allowed;
    }
    button {
      width: 100%;
      padding: 10px;
      border: 2px solid #000;
      background: var(--accent-dark);
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 4px 4px 0 #000;
      margin-top: 6px;
    }
    button:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0 #000;
    }
    .hint {
      font-size: 11px;
      color: #555;
      margin-top: -4px;
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 10px;
      font-size: 11px;
      color: #555;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 8px;
    }
  </style>
  <script>
    // ---------- Wagon / rake presets (tons + meters) ----------
    const rakePresets = {
      "BOXN": {
        tare: 23.2, payload: 58.0,
        wagons: 59,
        L: 10.713, W: 3.25, H: 3.26
      },
      "BOXNHL": {
        tare: 20.6, payload: 71.0,
        wagons: 58,
        L: 10.963, W: 3.25, H: 3.30
      },
      "BOXNHL25T": {
        tare: 21.0, payload: 78.4,
        wagons: 58,
        L: 10.963, W: 3.25, H: 3.23
      },
      "BOBRN": {
        tare: 24.0, payload: 63.7,
        wagons: 59,
        L: 11.600, W: 3.50, H: 3.735
      },
      "BOST": {
        tare: 25.5, payload: 55.78,
        wagons: 46,
        L: 13.729, W: 3.10, H: 3.08
      },
      "BRN": {
        tare: 24.4, payload: 62.6,
        wagons: 42,
        L: 14.645, W: 3.00, H: 2.54
      },
      "BRN22_9": {
        tare: 22.5, payload: 69.1,
        wagons: 42,
        L: 14.645, W: 3.13, H: 2.56
      }
    };

    // ---------- Product presets (dimensions as ranges + default unit weight) ----------
    const productPresets = {
      "HR_COIL": {
        label: "HR Coil",
        width: "900–2000 mm",
        thickness: "1.6–12 mm",
        length: "coil (continuous strip)",
        id: "610 mm",
        od: "1200–1600 mm",
        unitWeight: 20
      },
      "CR_COIL": {
        label: "CR Coil",
        width: "700–1700 mm",
        thickness: "0.3–3.0 mm",
        length: "coil (continuous strip)",
        id: "508 mm",
        od: "900–1500 mm",
        unitWeight: 10
      },
      "GP_GC_COIL": {
        label: "GP/GC Coil",
        width: "600–1250 mm",
        thickness: "0.3–1.2 mm",
        length: "coil (continuous strip)",
        id: "508 mm",
        od: "900–1450 mm",
        unitWeight: 8
      },
      "GC_SHEET": {
        label: "GC Sheet (corrugated)",
        width: "eff. 700–1100 mm",
        thickness: "0.3–1.0 mm",
        length: "1800–3660 mm",
        id: "N/A",
        od: "N/A",
        unitWeight: 0.015
      },
      "HR_SHEET": {
        label: "HR Sheet / Plate",
        width: "900–2000 mm",
        thickness: "1.6–20 mm",
        length: "2000–6000 mm",
        id: "N/A",
        od: "N/A",
        unitWeight: 1.0
      },
      "CR_SHEET": {
        label: "CR Sheet",
        width: "900–2000 mm",
        thickness: "0.3–3.0 mm",
        length: "2000–6000 mm",
        id: "N/A",
        od: "N/A",
        unitWeight: 0.5
      },
      "GP_SHEET": {
        label: "GP Sheet",
        width: "900–2000 mm",
        thickness: "0.3–1.2 mm",
        length: "2000–6000 mm",
        id: "N/A",
        od: "N/A",
        unitWeight: 0.4
      },
      "SLAB": {
        label: "Slab",
        width: "900–2200 mm",
        thickness: "200–250 mm",
        length: "2–12 m",
        id: "N/A",
        od: "N/A",
        unitWeight: 15
      },
      "BILLET": {
        label: "Billet",
        width: "100×100 / 125×125 / 150×150 mm",
        thickness: "square section",
        length: "3–12 m",
        id: "N/A",
        od: "N/A",
        unitWeight: 1.0
      },
      "BLOOM": {
        label: "Bloom",
        width: "200×200 – 300×300 mm",
        thickness: "square section",
        length: "3–12 m",
        id: "N/A",
        od: "N/A",
        unitWeight: 4.0
      },
      "TMT": {
        label: "TMT Rebar Bundle",
        width: "Ø 8–32 mm",
        thickness: "N/A",
        length: "12 m per bar (bundle)",
        id: "bundle Ø 500–700 mm",
        od: "N/A",
        unitWeight: 1.5
      },
      "WIRE_ROD": {
        label: "Wire Rod Coil",
        width: "Ø 5.5–12 mm",
        thickness: "N/A",
        length: "coil",
        id: "850–950 mm",
        od: "1100–1300 mm",
        unitWeight: 1.5
      }
    };

    function onWagonChange() {
      const sel = document.getElementById('wagon');
      const key = sel.value;

      const tareInput      = document.getElementById('tare');
      const maxInput       = document.getElementById('maxgross');
      const hint           = document.getElementById('wagonHint');

      const wagLenInput    = document.getElementById('wagonLen');
      const wagWidthInput  = document.getElementById('wagonWidth');
      const wagHeightInput = document.getElementById('wagonHeight');
      const rakeWagons     = document.getElementById('rakeWagons');
      const rakeLen        = document.getElementById('rakeLen');

      if (rakePresets[key]) {
        const w = rakePresets[key];

        tareInput.value = w.tare.toFixed(1);
        const gross = w.tare + w.payload;
        maxInput.value  = gross.toFixed(2);

        wagLenInput.value    = w.L.toFixed(3);
        wagWidthInput.value  = w.W.toFixed(2);
        wagHeightInput.value = w.H.toFixed(2);
        rakeWagons.value     = w.wagons.toString();
        const approxRake = w.L * w.wagons;
        rakeLen.value        = approxRake.toFixed(1);

        hint.textContent =
          "Preset: tare " + w.tare + " t, payload " + w.payload +
          " t; wagons " + w.wagons +
          ", per-wagon " + w.L.toFixed(3) + " m ⇒ rake ≈ " +
          approxRake.toFixed(1) + " m (wagons only).";
      } else {
        tareInput.value = "";
        maxInput.value  = "";
        wagLenInput.value    = "";
        wagWidthInput.value  = "";
        wagHeightInput.value = "";
        rakeWagons.value     = "";
        rakeLen.value        = "";
        hint.textContent = "Custom / other: enter tare & max gross manually; geometry is optional.";
      }
    }

    function onRakeWagonsChange() {
      const wagLenInput = document.getElementById('wagonLen');
      const rakeWagons  = document.getElementById('rakeWagons');
      const rakeLen     = document.getElementById('rakeLen');

      const L = parseFloat(wagLenInput.value);
      const n = parseInt(rakeWagons.value);

      if (!isNaN(L) && !isNaN(n) && n > 0) {
        rakeLen.value = (L * n).toFixed(1);
      } else {
        rakeLen.value = "";
      }
    }

    function onProductChange(idx) {
      const sel = document.getElementById('product' + idx);
      const key = sel.value;

      const widthInput      = document.getElementById('prodWidth' + idx);
      const thickInput      = document.getElementById('prodThickness' + idx);
      const lengthInput     = document.getElementById('prodLength' + idx);
      const idInput         = document.getElementById('prodID' + idx);
      const odInput         = document.getElementById('prodOD' + idx);
      const unitWeightInput = document.getElementById('unitWeight' + idx);
      const prodHint        = document.getElementById('prodHint' + idx);

      if (productPresets[key]) {
        const p = productPresets[key];
        widthInput.value  = p.width;
        thickInput.value  = p.thickness;
        lengthInput.value = p.length;
        idInput.value     = p.id;
        odInput.value     = p.od;
        unitWeightInput.value = p.unitWeight.toFixed(3);
        prodHint.textContent =
          p.label + " – ranges per Bokaro specs. Adjust unit weight if needed.";
      } else {
        widthInput.value  = "";
        thickInput.value  = "";
        lengthInput.value = "";
        idInput.value     = "";
        odInput.value     = "";
        unitWeightInput.value = "";
        prodHint.textContent = "Custom product: set unit weight & quantity.";
      }
    }
  </script>
</head>
<body onload="onWagonChange(); onProductChange(1); onProductChange(2); onProductChange(3);">
  <div class="card">
    <h1>Rake Load</h1>
    <form action="/calc" method="GET">
      <h2>Rake / Wagon</h2>
      <label for="rakeId">Rake ID</label>
      <input type="text" id="rakeId" name="rakeId" placeholder="e.g. R12345" required>

      <label for="wagon">Wagon / Rake Type</label>
      <select id="wagon" name="wagon" onchange="onWagonChange()">
        <option value="BOXN">BOXN – ore/coal (20.32t axle)</option>
        <option value="BOXNHL">BOXNHL – high load ore/coal</option>
        <option value="BOXNHL25T">BOXNHL25T – 25t axle ore</option>
        <option value="BOBRN">BOBRN / BOBRNHSM1 – hopper</option>
        <option value="BOST">BOST – finished steel / coal</option>
        <option value="BRN">BRN – flat wagon</option>
        <option value="BRN22_9">BRN22.9 – high axle flat</option>
        <option value="CUSTOM">Custom / Other</option>
      </select>
      <div class="hint" id="wagonHint">Custom / other: enter tare & max gross manually.</div>

      <h2>Products on Rake (max 3)</h2>
      <div class="hint">Empty rows are ignored. This just helps visualize a mixed rake.</div>

      <!-- Product 1 -->
      <h3>Product 1</h3>
      <label for="product1">Product Type</label>
      <select id="product1" name="product1" onchange="onProductChange(1)">
        <option value="HR_COIL">HR Coil</option>
        <option value="CR_COIL">CR Coil</option>
        <option value="GP_GC_COIL">GP/GC Coil</option>
        <option value="GC_SHEET">GC Sheet (corrugated)</option>
        <option value="HR_SHEET">HR Sheet / Plate</option>
        <option value="CR_SHEET">CR Sheet</option>
        <option value="GP_SHEET">GP Sheet</option>
        <option value="SLAB">Slab</option>
        <option value="BILLET">Billet</option>
        <option value="BLOOM">Bloom</option>
        <option value="TMT">TMT Rebar Bundle</option>
        <option value="WIRE_ROD">Wire Rod Coil</option>
        <option value="CUSTOM">Custom / Other</option>
      </select>
      <div class="hint" id="prodHint1">Custom product: set unit weight & quantity.</div>

      <div class="grid-2">
        <div>
          <label for="prodWidth1">Width / Dia range</label>
          <input type="text" id="prodWidth1" name="prodWidth1" readonly>
        </div>
        <div>
          <label for="prodThickness1">Thickness / Section</label>
          <input type="text" id="prodThickness1" name="prodThickness1" readonly>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label for="prodLength1">Length range</label>
          <input type="text" id="prodLength1" name="prodLength1" readonly>
        </div>
        <div>
          <label for="prodID1">Coil ID (if any)</label>
          <input type="text" id="prodID1" name="prodID1" readonly>
        </div>
      </div>
      <label for="prodOD1">Coil OD (if any)</label>
      <input type="text" id="prodOD1" name="prodOD1" readonly>

      <div class="grid-2">
        <div>
          <label for="unitWeight1">Unit weight (t)</label>
          <input type="number" step="0.001" id="unitWeight1" name="unitWeight1">
        </div>
        <div>
          <label for="qty1">Quantity (units)</label>
          <input type="number" id="qty1" name="qty1">
        </div>
      </div>

      <!-- Product 2 -->
      <h3>Product 2</h3>
      <label for="product2">Product Type</label>
      <select id="product2" name="product2" onchange="onProductChange(2)">
        <option value="CUSTOM" selected>None / Custom</option>
        <option value="HR_COIL">HR Coil</option>
        <option value="CR_COIL">CR Coil</option>
        <option value="GP_GC_COIL">GP/GC Coil</option>
        <option value="GC_SHEET">GC Sheet (corrugated)</option>
        <option value="HR_SHEET">HR Sheet / Plate</option>
        <option value="CR_SHEET">CR Sheet</option>
        <option value="GP_SHEET">GP Sheet</option>
        <option value="SLAB">Slab</option>
        <option value="BILLET">Billet</option>
        <option value="BLOOM">Bloom</option>
        <option value="TMT">TMT Rebar Bundle</option>
        <option value="WIRE_ROD">Wire Rod Coil</option>
      </select>
      <div class="hint" id="prodHint2">Custom product: set unit weight & quantity.</div>

      <div class="grid-2">
        <div>
          <label for="prodWidth2">Width / Dia range</label>
          <input type="text" id="prodWidth2" name="prodWidth2" readonly>
        </div>
        <div>
          <label for="prodThickness2">Thickness / Section</label>
          <input type="text" id="prodThickness2" name="prodThickness2" readonly>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label for="prodLength2">Length range</label>
          <input type="text" id="prodLength2" name="prodLength2" readonly>
        </div>
        <div>
          <label for="prodID2">Coil ID (if any)</label>
          <input type="text" id="prodID2" name="prodID2" readonly>
        </div>
      </div>
      <label for="prodOD2">Coil OD (if any)</label>
      <input type="text" id="prodOD2" name="prodOD2" readonly>

      <div class="grid-2">
        <div>
          <label for="unitWeight2">Unit weight (t)</label>
          <input type="number" step="0.001" id="unitWeight2" name="unitWeight2">
        </div>
        <div>
          <label for="qty2">Quantity (units)</label>
          <input type="number" id="qty2" name="qty2">
        </div>
      </div>

      <!-- Product 3 -->
      <h3>Product 3</h3>
      <label for="product3">Product Type</label>
      <select id="product3" name="product3" onchange="onProductChange(3)">
        <option value="CUSTOM" selected>None / Custom</option>
        <option value="HR_COIL">HR Coil</option>
        <option value="CR_COIL">CR Coil</option>
        <option value="GP_GC_COIL">GP/GC Coil</option>
        <option value="GC_SHEET">GC Sheet (corrugated)</option>
        <option value="HR_SHEET">HR Sheet / Plate</option>
        <option value="CR_SHEET">CR Sheet</option>
        <option value="GP_SHEET">GP Sheet</option>
        <option value="SLAB">Slab</option>
        <option value="BILLET">Billet</option>
        <option value="BLOOM">Bloom</option>
        <option value="TMT">TMT Rebar Bundle</option>
        <option value="WIRE_ROD">Wire Rod Coil</option>
      </select>
      <div class="hint" id="prodHint3">Custom product: set unit weight & quantity.</div>

      <div class="grid-2">
        <div>
          <label for="prodWidth3">Width / Dia range</label>
          <input type="text" id="prodWidth3" name="prodWidth3" readonly>
        </div>
        <div>
          <label for="prodThickness3">Thickness / Section</label>
          <input type="text" id="prodThickness3" name="prodThickness3" readonly>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label for="prodLength3">Length range</label>
          <input type="text" id="prodLength3" name="prodLength3" readonly>
        </div>
        <div>
          <label for="prodID3">Coil ID (if any)</label>
          <input type="text" id="prodID3" name="prodID3" readonly>
        </div>
      </div>
      <label for="prodOD3">Coil OD (if any)</label>
      <input type="text" id="prodOD3" name="prodOD3" readonly>

      <div class="grid-2">
        <div>
          <label for="unitWeight3">Unit weight (t)</label>
          <input type="number" step="0.001" id="unitWeight3" name="unitWeight3">
        </div>
        <div>
          <label for="qty3">Quantity (units)</label>
          <input type="number" id="qty3" name="qty3">
        </div>
      </div>

      <h2>Weight / Weighbridge</h2>
      <label for="tare">Rake Tare Weight (tons)</label>
      <input type="number" step="0.01" id="tare" name="tare" placeholder="e.g. 150" required>

      <label for="maxgross">Max Gross Weight (tons)</label>
      <input type="number" step="0.01" id="maxgross" name="maxgross" placeholder="e.g. 300" required>
      <div class="hint">Rake + cargo max allowed on track (per wagon spec / PCC).</div>

      <label for="totalw">Current Weighbridge Reading (tons) (optional)</label>
      <input type="number" step="0.01" id="totalw" name="totalw" placeholder="If known, enter measured gross weight">

      <h2>Rake Geometry</h2>
      <div class="grid-2">
        <div>
          <label for="wagonLen">Per-wagon length (m)</label>
          <input type="number" step="0.001" id="wagonLen" name="wagonLen" readonly>
        </div>
        <div>
          <label for="wagonWidth">Per-wagon width (m)</label>
          <input type="number" step="0.01" id="wagonWidth" name="wagonWidth" readonly>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label for="wagonHeight">Per-wagon height (m)</label>
          <input type="number" step="0.01" id="wagonHeight" name="wagonHeight" readonly>
        </div>
        <div>
          <label for="rakeWagons">Wagons per rake</label>
          <input type="number" id="rakeWagons" name="rakeWagons" oninput="onRakeWagonsChange()">
        </div>
      </div>
      <label for="rakeLen">Approx rake length (m, wagons only)</label>
      <input type="number" step="0.1" id="rakeLen" name="rakeLen" readonly>
      <div class="hint">Total train length ≈ rake length + loco(s) + brake van (~40–60 m extra).</div>

      <button type="submit">Calculate</button>
    </form>
    <div class="footer">
      Connect to Wi-Fi <b>Rake-IoT</b> and open <b>192.168.4.1</b>.
    </div>
  </div>
</body>
</html>
)rawliteral";

// --------- helper to build HTML result ----------
String htmlHeader(const String &title) {
  String s;
  s += F("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
  s += F("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
  s += F("<title>");
  s += title;
  s += F("</title><style>"
         "body{background:#f5f5f5;margin:0;padding:16px;display:flex;justify-content:center;}"
         ".card{max-width:520px;width:100%;background:#fff;border:3px solid #000;"
         "box-shadow:6px 6px 0 #000;padding:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}"
         "h1{font-size:22px;margin:0 0 16px 0;padding:8px 10px;background:#ffcc00;border:2px solid #000;display:inline-block;}"
         ".tag{display:inline-block;font-size:11px;border:2px solid #000;padding:2px 6px;margin-right:4px;margin-top:4px;}"
         ".danger{background:#ff3366;color:#fff;}"
         "table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;}"
         "td{padding:4px 6px;border-bottom:1px solid #ddd;vertical-align:top;}"
         ".label{font-weight:600;}"
         "a.btn{display:inline-block;margin-top:12px;padding:8px 10px;border:2px solid #000;background:#222;"
         "color:#fff;text-decoration:none;font-size:13px;font-weight:700;text-transform:uppercase;}"
         ".rakeviz{margin-top:4px;border:3px solid #000;padding:3px;}"
         ".rake-row{display:flex;height:16px;margin-bottom:3px;}"
         ".rake-row:last-child{margin-bottom:0;}"
         ".slot{flex:1;border-right:1px solid #000;}"
         ".slot:last-child{border-right:none;}"
         ".p1{background:#ffcc80;}"
         ".p2{background:#80deea;}"
         ".p3{background:#ce93d8;}"
         "</style></head><body><div class='card'>");
  return s;
}

String htmlFooter() {
  return F("</div></body></html>");
}

// ---------------- Route Handlers ----------------

void handleRoot() {
  server.send(200, "text/html", INDEX_HTML);
}

void handleCalc() {
  // Rake / wagon
  String rakeId   = server.hasArg("rakeId") ? server.arg("rakeId") : "";
  String wagon    = server.hasArg("wagon")  ? server.arg("wagon")  : "";

  double tare     = server.hasArg("tare")     ? server.arg("tare").toDouble()     : 0.0;
  double maxgross = server.hasArg("maxgross") ? server.arg("maxgross").toDouble() : 0.0;
  double totalw   = server.hasArg("totalw")   ? server.arg("totalw").toDouble()   : 0.0;

  // Geometry
  double wagLen    = server.hasArg("wagonLen")   ? server.arg("wagonLen").toDouble()   : 0.0;
  double wagWidth  = server.hasArg("wagonWidth") ? server.arg("wagonWidth").toDouble() : 0.0;
  double wagHeight = server.hasArg("wagonHeight")? server.arg("wagonHeight").toDouble(): 0.0;
  int    rakeWags  = server.hasArg("rakeWagons") ? server.arg("rakeWagons").toInt()    : 0;
  double rakeLen   = server.hasArg("rakeLen")    ? server.arg("rakeLen").toDouble()    : 0.0;
  if (rakeLen <= 0 && wagLen > 0 && rakeWags > 0) {
    rakeLen = wagLen * rakeWags;
  }

  // Product 1
  String product1      = server.hasArg("product1")      ? server.arg("product1")      : "";
  String prodWidth1    = server.hasArg("prodWidth1")    ? server.arg("prodWidth1")    : "";
  String prodThickness1= server.hasArg("prodThickness1")? server.arg("prodThickness1"): "";
  String prodLength1   = server.hasArg("prodLength1")   ? server.arg("prodLength1")   : "";
  String prodID1       = server.hasArg("prodID1")       ? server.arg("prodID1")       : "";
  String prodOD1       = server.hasArg("prodOD1")       ? server.arg("prodOD1")       : "";
  double unitWeight1   = server.hasArg("unitWeight1")   ? server.arg("unitWeight1").toDouble() : 0.0;
  long   qty1          = server.hasArg("qty1")          ? server.arg("qty1").toInt()          : 0;
  double weight1       = unitWeight1 * qty1;

  // Product 2
  String product2      = server.hasArg("product2")      ? server.arg("product2")      : "";
  String prodWidth2    = server.hasArg("prodWidth2")    ? server.arg("prodWidth2")    : "";
  String prodThickness2= server.hasArg("prodThickness2")? server.arg("prodThickness2"): "";
  String prodLength2   = server.hasArg("prodLength2")   ? server.arg("prodLength2")   : "";
  String prodID2       = server.hasArg("prodID2")       ? server.arg("prodID2")       : "";
  String prodOD2       = server.hasArg("prodOD2")       ? server.arg("prodOD2")       : "";
  double unitWeight2   = server.hasArg("unitWeight2")   ? server.arg("unitWeight2").toDouble() : 0.0;
  long   qty2          = server.hasArg("qty2")          ? server.arg("qty2").toInt()          : 0;
  double weight2       = unitWeight2 * qty2;

  // Product 3
  String product3      = server.hasArg("product3")      ? server.arg("product3")      : "";
  String prodWidth3    = server.hasArg("prodWidth3")    ? server.arg("prodWidth3")    : "";
  String prodThickness3= server.hasArg("prodThickness3")? server.arg("prodThickness3"): "";
  String prodLength3   = server.hasArg("prodLength3")   ? server.arg("prodLength3")   : "";
  String prodID3       = server.hasArg("prodID3")       ? server.arg("prodID3")       : "";
  String prodOD3       = server.hasArg("prodOD3")       ? server.arg("prodOD3")       : "";
  double unitWeight3   = server.hasArg("unitWeight3")   ? server.arg("unitWeight3").toDouble() : 0.0;
  long   qty3          = server.hasArg("qty3")          ? server.arg("qty3").toInt()          : 0;
  double weight3       = unitWeight3 * qty3;

  double plannedCargoWeight = weight1 + weight2 + weight3;
  long   plannedUnits       = qty1 + qty2 + qty3;

  bool   hasWeighbridge     = totalw > 0.001;
  double cargoMax           = maxgross - tare;
  if (cargoMax < 0) cargoMax = 0;

  double cargoWeight;          // used for fill / overload
  double measuredCargoWeight;  // from weighbridge
  double diffPlannedMeasured = 0.0;

  if (hasWeighbridge) {
    measuredCargoWeight = totalw - tare;
    cargoWeight         = measuredCargoWeight;
    diffPlannedMeasured = measuredCargoWeight - plannedCargoWeight;
  } else {
    measuredCargoWeight = 0.0;
    cargoWeight         = plannedCargoWeight;
  }

  double fillPercent  = (cargoMax > 0) ? (cargoWeight / cargoMax) * 100.0 : 0.0;
  if (fillPercent < 0)   fillPercent = 0;
  if (fillPercent > 150) fillPercent = 150;
  double emptyPercent = 100.0 - fillPercent;

  bool overload = (cargoMax > 0) && (cargoWeight > cargoMax + 0.001);

  // Build HTML response
  String html = htmlHeader("Rake Load Result");
  html += F("<h1>Result</h1>");

  if (wagon.length()) {
    html += F("<div class='tag'>Wagon: ");
    html += wagon;
    html += F("</div>");
  }

  if (rakeId.length()) {
    html += F("<div class='tag'>Rake: ");
    html += rakeId;
    html += F("</div>");
  }

  if (overload) {
    html += F("<div class='tag danger'>OVERLOADED vs payload limit</div>");
  }

  html += F("<table>");

  // Weight model
  html += F("<tr><td class='label'>Rake tare</td><td>");
  html += String(tare, 2);
  html += F(" t</td></tr>");

  html += F("<tr><td class='label'>Max gross (tare + payload)</td><td>");
  html += String(maxgross, 2);
  html += F(" t</td></tr>");

  html += F("<tr><td class='label'>Payload limit (model)</td><td>");
  html += String(cargoMax, 2);
  html += F(" t</td></tr>");

  html += F("<tr><td class='label'>Planned cargo weight (from products)</td><td>");
  html += String(plannedCargoWeight, 2);
  html += F(" t</td></tr>");

  if (hasWeighbridge) {
    html += F("<tr><td class='label'>Weighbridge gross</td><td>");
    html += String(totalw, 2);
    html += F(" t</td></tr>");

    html += F("<tr><td class='label'>Cargo weight (measured)</td><td>");
    html += String(measuredCargoWeight, 2);
    html += F(" t</td></tr>");

    html += F("<tr><td class='label'>Measured - planned</td><td>");
    html += String(diffPlannedMeasured, 2);
    html += F(" t</td></tr>");
  } else {
    html += F("<tr><td class='label'>Cargo weight (used for calc)</td><td>");
    html += String(cargoWeight, 2);
    html += F(" t (no weighbridge, using planned)</td></tr>");
  }

  html += F("<tr><td class='label'>Total units on rake</td><td>");
  html += String(plannedUnits);
  html += F("</td></tr>");

  html += F("<tr><td class='label'>Rake fill</td><td>");
  html += String(fillPercent, 1);
  html += F(" %</td></tr>");

  html += F("<tr><td class='label'>Rake empty</td><td>");
  html += String(emptyPercent, 1);
  html += F(" %</td></tr>");

  // Simple rake visualization (qualitative, like your sketch)
  int slots1 = (qty1 > 0) ? (qty1 < 10 ? qty1 : 10) : 0;
  int slots2 = (qty2 > 0) ? (qty2 < 10 ? qty2 : 10) : 0;
  int slots3 = (qty3 > 0) ? (qty3 < 10 ? qty3 : 10) : 0;

  if (slots1 + slots2 + slots3 > 0) {
    html += F("<tr><td class='label'>Rake layout (schematic)</td><td>");
    html += F("<div class='rakeviz'>");

    if (slots1 > 0) {
      html += F("<div class='rake-row'>");
      for (int i = 0; i < slots1; i++) {
        html += F("<div class='slot p1'></div>");
      }
      html += F("</div>");
    }
    if (slots2 > 0) {
      html += F("<div class='rake-row'>");
      for (int i = 0; i < slots2; i++) {
        html += F("<div class='slot p2'></div>");
      }
      html += F("</div>");
    }
    if (slots3 > 0) {
      html += F("<div class='rake-row'>");
      for (int i = 0; i < slots3; i++) {
        html += F("<div class='slot p3'></div>");
      }
      html += F("</div>");
    }

    html += F("</div>");
    html += F("<div style='font-size:11px;color:#555;margin-top:4px;'>"
              "Rows from top: Product1 (orange), Product2 (blue), Product3 (purple). "
              "Max 10 boxes per row – schematic only, not to scale."
              "</div>");
    html += F("</td></tr>");
  }

  // Product breakdown text
  if (qty1 > 0 || unitWeight1 > 0) {
    html += F("<tr><td class='label'>Product 1</td><td>");
    html += product1;
    html += F("<br>Unit: ");
    html += String(unitWeight1, 3);
    html += F(" t × ");
    html += String(qty1);
    html += F(" = ");
    html += String(weight1, 2);
    html += F(" t");
    if (prodWidth1.length() || prodThickness1.length() || prodLength1.length()) {
      html += F("<br>Dim: ");
      if (prodWidth1.length()) {
        html += F("W/Dia ");
        html += prodWidth1;
        html += F("; ");
      }
      if (prodThickness1.length()) {
        html += F("Thk ");
        html += prodThickness1;
        html += F("; ");
      }
      if (prodLength1.length()) {
        html += F("L ");
        html += prodLength1;
      }
    }
    if (prodID1.length() || prodOD1.length()) {
      html += F("<br>Coil ID/OD: ");
      if (prodID1.length()) {
        html += F("ID ");
        html += prodID1;
        html += F(" ");
      }
      if (prodOD1.length()) {
        html += F("OD ");
        html += prodOD1;
      }
    }
    html += F("</td></tr>");
  }

  if (qty2 > 0 || unitWeight2 > 0) {
    html += F("<tr><td class='label'>Product 2</td><td>");
    html += product2;
    html += F("<br>Unit: ");
    html += String(unitWeight2, 3);
    html += F(" t × ");
    html += String(qty2);
    html += F(" = ");
    html += String(weight2, 2);
    html += F(" t");
    if (prodWidth2.length() || prodThickness2.length() || prodLength2.length()) {
      html += F("<br>Dim: ");
      if (prodWidth2.length()) {
        html += F("W/Dia ");
        html += prodWidth2;
        html += F("; ");
      }
      if (prodThickness2.length()) {
        html += F("Thk ");
        html += prodThickness2;
        html += F("; ");
      }
      if (prodLength2.length()) {
        html += F("L ");
        html += prodLength2;
      }
    }
    if (prodID2.length() || prodOD2.length()) {
      html += F("<br>Coil ID/OD: ");
      if (prodID2.length()) {
        html += F("ID ");
        html += prodID2;
        html += F(" ");
      }
      if (prodOD2.length()) {
        html += F("OD ");
        html += prodOD2;
      }
    }
    html += F("</td></tr>");
  }

  if (qty3 > 0 || unitWeight3 > 0) {
    html += F("<tr><td class='label'>Product 3</td><td>");
    html += product3;
    html += F("<br>Unit: ");
    html += String(unitWeight3, 3);
    html += F(" t × ");
    html += String(qty3);
    html += F(" = ");
    html += String(weight3, 2);
    html += F(" t");
    if (prodWidth3.length() || prodThickness3.length() || prodLength3.length()) {
      html += F("<br>Dim: ");
      if (prodWidth3.length()) {
        html += F("W/Dia ");
        html += prodWidth3;
        html += F("; ");
      }
      if (prodThickness3.length()) {
        html += F("Thk ");
        html += prodThickness3;
        html += F("; ");
      }
      if (prodLength3.length()) {
        html += F("L ");
        html += prodLength3;
      }
    }
    if (prodID3.length() || prodOD3.length()) {
      html += F("<br>Coil ID/OD: ");
      if (prodID3.length()) {
        html += F("ID ");
        html += prodID3;
        html += F(" ");
      }
      if (prodOD3.length()) {
        html += F("OD ");
        html += prodOD3;
      }
    }
    html += F("</td></tr>");
  }

  // Geometry recap
  if (wagLen > 0 || rakeWags > 0 || rakeLen > 0) {
    html += F("<tr><td class='label'>Per-wagon length</td><td>");
    html += String(wagLen, 3);
    html += F(" m</td></tr>");

    html += F("<tr><td class='label'>Per-wagon width</td><td>");
    html += String(wagWidth, 2);
    html += F(" m</td></tr>");

    html += F("<tr><td class='label'>Per-wagon height</td><td>");
    html += String(wagHeight, 2);
    html += F(" m</td></tr>");

    html += F("<tr><td class='label'>Wagons per rake</td><td>");
    html += String(rakeWags);
    html += F("</td></tr>");

    html += F("<tr><td class='label'>Approx rake length</td><td>");
    html += String(rakeLen, 1);
    html += F(" m (wagons only)</td></tr>");
  }

  html += F("</table>");

  html += F("<a class='btn' href='/'>New Calculation</a>");
  html += htmlFooter();

  server.send(200, "text/html", html);
}

void handleNotFound() {
  String message = "Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  server.send(404, "text/plain", message);
}

// ---------------- Setup & Loop ----------------

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("Starting Rake IoT AP...");

  WiFi.mode(WIFI_AP);
  WiFi.softAP("Rake-IoT", "12345678");  // change password if needed
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  server.on("/", handleRoot);
  server.on("/calc", handleCalc);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
