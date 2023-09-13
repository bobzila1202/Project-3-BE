const {PythonShell, PythonShellError} = require("python-shell")

const path = './test.py'

async function checkPython(code){
    const ok = await PythonShell.checkSyntaxFile(code);
    if(err){
        throw new Error(err)
    }
}




checkPython(path)