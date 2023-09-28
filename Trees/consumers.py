import json
from channels.generic.websocket import WebsocketConsumer
from random import randint
from .models import Branch, Profile
import pprint

class PracticeConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
    def receive(self, text_data):
        #This string contains the data the users has.
        data = json.loads(text_data)
        #Here we will store the response
        response = {}
        #First of all, in order to see if the user has the correct number of leafs:
        #We calculate all the possible leafs.
        all_possible_leafs = []
        #And count the leafs that the user has.
        all_actual_leafs = []
        #Now onto analyzing the data.
        for i in data:
            #Here are the leafs the user should have theoretically.
            if i=='all_actual_leafs':
                for x in data[i].split('|'):
                    all_possible_leafs.extend(Branch.objects.filter(leaf_parent=Branch.objects.get(id=x), hidden=False, focused='').values_list('id', flat=True))
            #Now onto analyzing each leaf. Make sure that the i is an int.
            elif i!='' and Branch.objects.filter(id=i).exists():
                #Get the actual leaf from the DB.
                target = Branch.objects.get(id=int(i))
                all_actual_leafs.append(int(i))
                #First look if the leaf is focused or not.
                if data[i].split('|')[0]=='focus':
                    target.focused = data[i].split('|')[1]
                    target.save()

                elif data[i].split('|')[0]=='focusout':
                    target.focused = ''
                    target.save()
                
                #Check if should be in the trash.
                elif target.hidden:
                    response[i] = 'None'

                #Now check if it has the correct data.
                else:
                    #Check the text
                    response[i] = {
                        'text': 'updated',
                        'image': 'updated',
                        'parent': str(target.leaf_parent.id)+'|'+str(target.order),
                        'focused': 'no',
                    }
                    if len(target.text)!=int(data[i].split('|')[0]):
                        response[i]['text'] = target.text
                    if data[i].split('|')[2]!='image' and target.image:
                        response[i]['image'] = target.image.url
                    if target.focused != '':
                        response[i]['focused'] = target.focused

        difference = [leaf for leaf in all_possible_leafs if leaf not in all_actual_leafs]
        for d in difference:
            leaf = Branch.objects.get(id=d)
            if leaf.focused=='':
                response[str(d)] = str(leaf.order)+'|'+str(leaf.leaf_parent.id)
        self.send(text_data=json.dumps(response))
