/*
This website uses the web serial API to read the output of serial data of the microcontroller and convert the data into a table of web page elements. In addition, the table data in the web page can also be downloaded to the local computer and stored in Excel format, which facilitates users to conduct subsequent Excel data analysis.
*/

var data_table = null;
var serial_port_monitor = document.getElementById("serial_monitor");
var serial_button = document.getElementById("serial_button");
var baud_rate_element = document.getElementById("baud_rate");
var _baud_rate = "NULL";
var _serial = null;
var _port = null;
var _decoder = new TextDecoderStream();  // 將 bit data 解碼為文字
var _reader = null;
let _buffer = "";

async function requestSerialPort(){
    // 建立web預覽器的serial物件
    _serial = navigator.serial;
    // 選擇目標（Serial Port）
    try{
        _port = await _serial.requestPort();
         // 設定 baud rate
        await _port.open({ baudRate: Number(_baud_rate) });
    }catch(error){
        alert(error);
        return 0;
    }
    const readableStreamClosed = _port.readable.pipeTo(_decoder.writable);
    _reader = _decoder.readable.getReader();
    // Listen to data coming from the serial device.
    var _buffer = "";
    var is_new_line = false;
    var serial_data = [];
    while (true) {
        const { value, done } = await _reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            _reader.releaseLock();
            break;
        }
        _buffer = _buffer + value;
        is_new_line = _buffer.slice(-1)==="\n" ? true : false;
        serial_data = _buffer.split("\r\n");
        while(true){
            //console.log(serial_data.length);
            //console.log(serial_data.shift());
            //console.log(serial_data.length === undefined);
            if(! (serial_data.length === 1)){
                var _row = serial_data.shift();
                await makeTableRow("serial_data", _row);
                //var p = document.createElement('p');
                //p.textContent = serial_data.shift();
                //console.log(p.textContent);
                //serial_port_monitor.appendChild(p);
            }else{
                _buffer = serial_data.pop();
                break;
            }
        }
    }
}

serial_button.addEventListener("click", (event) => {
    _baud_rate = baud_rate_element.value;
    if(_baud_rate != "NULL"){
        requestSerialPort();
    }else{
        alert("「未」選擇序列埠傳輸速率！請選擇傳輸速率！！");
    }
    
});

function makeTableRow(serial_table_id, string_data){
    if(data_table === null){
        data_table = document.getElementById(serial_table_id);
    }
    string_data = string_data.replace(" ", "");
    string_data = string_data.split(",");
    let _data_row = data_table.insertRow(-1);
    let _counter = 0;
    while(string_data.length!=0){
        let _cell = _data_row.insertCell(_counter);
        _cell.innerHTML = string_data.shift();
        _counter++;
    }
}
