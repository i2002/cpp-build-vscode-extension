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
                result += (result != "") ? '\n' : '';
                result += `# ${element.textContent}\n`;
                break;

            case "H2":
                result += (result != "") ? '\n' : '';
                result += `## ${element.textContent}\n`;
                break;

            case "H3":
                result += (result != "") ? '\n' : '';
                result += `### ${element.textContent}\n`;
                break;

            case "P":
                let str = element.innerHTML;

                str = str.replace(/\n/g, ""); // remove newlines
                str = str.replace(/<br>/g, "   \n"); // newline
                str = str.replace(/<code>(.*?)<\/code>/g, "`$1`"); // code
                str = str.replace(/<strong>(.*?)<\/strong>/g, "**$1**"); // bold
                str = str.replace(/<span class=".*">(.*?)<\/span>/g, "`$1`"); // span
                str = str.replace(/<img src="(.*?)" alt="(.*?)">/g, "\n![$2]($1)\n"); // image
                
                result += str + '\n';
                break;

            case "PRE":
                result += `~~~\n${element.textContent}~~~\n\n`;
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