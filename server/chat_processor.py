import sys
import json
import os

def process_query(query: str) -> str:
    try:
        if not query.strip():
            return "Please provide a question about mutual funds or financial topics."

        # Basic responses for testing
        responses = {
            "mutual": "Mutual funds are investment vehicles that pool money from multiple investors to purchase securities.",
            "fund": "A fund is a collection of money from multiple investors used to purchase various securities.",
            "investment": "Investment is the act of allocating resources, usually money, with the expectation of generating profit.",
            "portfolio": "A portfolio is a collection of financial investments like stocks, bonds, commodities and cash.",
        }

        # Simple keyword matching
        query_lower = query.lower()
        for keyword, response in responses.items():
            if keyword in query_lower:
                return response

        return "Could you please ask about mutual funds, investments, or portfolio management?"

    except Exception as e:
        print(f"Error in process_query: {str(e)}", file=sys.stderr)
        return "I encountered an issue while processing your request. Please try again."

def main():
    for line in sys.stdin:
        try:
            input_data = json.loads(line)
            query = input_data.get('message', '')
            response = process_query(query)
            print(response)
        except json.JSONDecodeError:
            print("Error: Invalid JSON input")
        except Exception as e:
            print(f"Error processing query: {str(e)}")
        break

if __name__ == "__main__":
    main()