import re
import random
import string
from collections import defaultdict

# TailwindCSS 生成的 CSS 文件路径
input_css_file = '../tailwind.css'
output_mapping_file = 'class_mapping.json'

# 随机生成混淆后的类名
def generate_random_classname(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# 读取 TailwindCSS 文件，并提取所有类名
def extract_classnames(css_file):
    with open(css_file, 'r') as file:
        css_content = file.read()

    # 使用正则表达式匹配类名（形如 .class-name）
    classnames = set(re.findall(r'\.([a-zA-Z0-9\-\:\/]+)', css_content))
    return classnames

# 生成类名映射
def generate_classname_mapping(classnames):
    class_mapping = defaultdict(str)

    for classname in classnames:
        obfuscated_name = generate_random_classname()
        class_mapping[classname] = obfuscated_name

    return class_mapping

# 保存类名映射为 JSON 文件
def save_mapping_to_file(class_mapping, output_file):
    import json
    with open(output_file, 'w') as outfile:
        json.dump(class_mapping, outfile, indent=4)
    print(f'Class name mapping saved to {output_file}')

if __name__ == "__main__":
    classnames = extract_classnames(input_css_file)
    class_mapping = generate_classname_mapping(classnames)
    save_mapping_to_file(class_mapping, output_mapping_file)
    print("Classname obfuscation complete.")
