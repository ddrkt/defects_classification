import pdb
from bs4 import BeautifulSoup
import shutil

annotations_path = 'datasets/phones/annotations/annotations'
photos_path = 'datasets/phones/selected_zip'
base_path = 'datasets/phones'


MAX_FILE = 300

def annotation_name(index):
    return f"Datacluster Cracked Screen ({index}).xml"

photos_categorized = []
for item in list(range(1, MAX_FILE + 1)):
    if item == 34:
        continue
    with open(f"{annotations_path}/{annotation_name(item)}", 'r') as f:
        data = f.read()
        bs_data = BeautifulSoup(data, 'xml')
        photo_name = bs_data.select('annotation')[0].find('filename').text
        try:
            category_name = bs_data.select('annotation')[0].find('object').find('name').text
        except:
            pdb.set_trace()

        photos_categorized.append({'name': photo_name, 'category': category_name})



for photo in photos_categorized:
    shutil.copyfile(
        f"{photos_path}/{photo['name']}",
        f"{base_path}/{photo['category']}/{photo['name']}"
    )
