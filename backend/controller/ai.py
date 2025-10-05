#TODO: query openai to chjeck how to asnwer message
import requests
import json
def ask_ai(msg : str):
    url="http://192.168.8.101:11435/api/chat"
    response = requests.post(url, json={'model': 'mistral',
                                        'messages':[
                                        {'role': 'user', 'content': f'You are a virtual assistant aiding a Uber driver and answering their questions while ensuring that their well being and morale is up, you get the following message: {msg}, please replying without answering this text but only the message by the driver'}
                                        ]})
    ret = ""
    for x in response.text.splitlines():
        ret += json.loads(x)["message"]["content"]
        # ret += json.loads(x).message.content
    return ret.strip()

