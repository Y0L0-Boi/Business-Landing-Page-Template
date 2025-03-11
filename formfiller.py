from transformers import pipeline
import re

class FinancialFormFiller:
    def __init__(self):
        self.qa_pipeline = pipeline(
            "question-answering",
            model="bert-large-uncased-whole-word-masking-finetuned-squad"
        )
        self.form_structure = {
            "Personal Information": {
                "Full Name": "What is the full name?",
                "Age": "What is the age?",
                "Occupation": "What is the occupation?",
                "Monthly Income": "What is the monthly income?",
                "Additional Income Sources": [
                    ("Type", "What is the first additional income source type?"),
                    ("Amount", "What is the first additional income amount?"),
                    ("Type", "What is the second additional income source type?", 1),
                    ("Amount", "What is the second additional income amount?", 1)
                ],
                "Fixed Monthly Expenses": "What are the fixed monthly expenses?",
                "Variable Monthly Expenses": "What are the variable monthly expenses?",
                "Dependents": [
                    ("Number", "How many dependents are there?"),
                    "Relationship(s)"
                ]
            },
            # Add other sections following similar structure
        }

    def extract_value(self, context, question):
        try:
            result = self.qa_pipeline(question=question, context=context)
            value = result['answer'].strip()
            return self._format_value(value) if value else "Nil"
        except:
            return "Nil"

    def _format_value(self, value):
        # Currency formatting
        if re.search(r'₹|rs|inr', value, re.I):
            numbers = re.findall(r'\d+[\d,]*', value)
            if numbers:
                formatted = f"₹{int(numbers[0].replace(',', '')):,}"
                return formatted
        return value

    def process_input(self, text):
        results = {}
        for section, fields in self.form_structure.items():
            section_results = {}
            for field, query in fields.items():
                if isinstance(query, list):
                    list_items = []
                    for item in query:
                        if isinstance(item, tuple):
                            q = item[1]
                            val = self.extract_value(text, q)
                            list_items.append(f"{item[0]}: {val}")
                    section_results[field] = "\n- ".join(list_items) if list_items else "Nil"
                else:
                    section_results[field] = self.extract_value(text, query)
            results[section] = section_results
        return results

    def print_results(self, results):
        for section, fields in results.items():
            print(f"\n## {section}")
            for field, value in fields.items():
                print(f"{field}: {value if value else 'Nil'}")

# Usage Example
form_filler = FinancialFormFiller()

sample_input = """
My name is Rohan Mehta. I'm 28 years old working as a software engineer earning ₹75,000 per month. 
I have rental income of ₹15,000 and freelance income of ₹10,000. My fixed expenses are ₹35,000 
and variable expenses around ₹20,000. I have 2 dependents - my parents.
"""

results = form_filler.process_input(sample_input)
form_filler.print_results(results)
