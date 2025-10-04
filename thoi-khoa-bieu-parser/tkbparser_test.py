import openpyxl

from parser import TKBParser


def main():
    work_book = openpyxl.load_workbook("./examples/TKB20251-FULL.xlsx")
    parsed_classes = TKBParser().parse(work_book)
    print(parsed_classes[0])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
