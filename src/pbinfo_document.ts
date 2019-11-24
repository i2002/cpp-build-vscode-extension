import * as vscode from 'vscode';
import axios from 'axios';
import * as jsdom from 'jsdom';

export class PbinfoProvider implements vscode.TextDocumentContentProvider {
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        return await this.parseData(uri.path);
    }

    async parseData(number: string): Promise<string> {
        const res = await axios.get('https://www.pbinfo.ro/ajx-module/ajx-problema-afisare-enunt.php?id=' + number);
        let result = "";
		let dom = new jsdom.JSDOM(res.data).window.document;
        var content = dom.querySelector('article');
        if(!content) {
            throw Error("No data received");
        }

        for(let i = 0; i < content.children.length; i++)
        {
            let element: any = content.children[i];
            switch(element.nodeName)
            {
            case "H1":
                if(result != "") {
                    result += `\n`;
                }
                result += `# ${element.textContent}\n`;
                break;
            case "P":
                let str = element.innerHTML;
                result += str.replace(/<code>(.*?)<\/code>/g, "`$1`") + '\n';
                break;
            case "PRE":
                result += `${element.textContent}\n`;
                break;
            case "UL":
                for(let j = 0; j < element.children.length; j++) {
                    result += `- ${element.children[j].textContent}\n`;
                }
                break;
            }
        }
        return result;
    }
}