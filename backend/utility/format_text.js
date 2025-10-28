import ollama from 'ollama'

export async function format_text_to_html_llm(text='Sample Text: This is sample text, please provide your own text!', model='gemma3:12b'){

    let content = 
`
You would be provided with a piece of text which may contain headings, subheadings, paragraphs etc. Your task is to convert that into beautifully formatted HTML + CSS to be displayed on a webpage. Use coloring, font-size, font-style, grid, flex-box, HTML divs to make icons etc.
1) Follow this outer outline in your output:
<style>
    This will contain the CSS styles
</style>
<div>
    This will contain the content
</div>

Within this outer outline, you can use use almost all HTML tags EXCEPT top-level tags like <html>, <head>, <body> etc.
2) Note that your task is just to format, do not change the text AT ALL, just make it presentable using HTML + CSS
3) You can NOT use Javascript, you can only use HTML + CSS
4) Directly provide the requested output, no narration, commentary, explanantion, not even marking quotes like \`\`\` what-so-ever.

[TEXT START]\n\n${text}\n\n[TEXT END]

5) Make the styling without any background and width consideration such that it inherits it's parent element's background and the entire width of parent.
6) Now, your output (NO quotations to mark that you are giving html), directly start like so:

<style>
    ...
`
    
    return new Promise(async (resolve, reject) => {
        const response = await ollama.chat({
        model: model,
        stream: false,
        messages: [{ role: 'user', content: content }],
        "options": {
            "num_ctx": 32224
        }
        })
        console.log(response.message.content);
        resolve(response.message.content)
    })
}




            

