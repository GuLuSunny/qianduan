import pefile

def parse_pe_file(新年快乐.exe):
    try:
        # 加载PE文件
        pe = pefile.PE(新年快乐.exe)

        # 打印基本信息
        print(f"PE Header起始地址: 0x{pe.DOS_HEADER.e_lfanew:08X}")
        print(f"CPU类型: {pe.FILE_HEADER.Machine}")
        print(f"节表数量: {pe.FILE_HEADER.NumberOfSections}")
        print(f"IMAGE_OPTIONAL_HEADER大小: {pe.OPTIONAL_HEADER.size}")
        print(f"程序入口RVA: 0x{pe.OPTIONAL_HEADER.AddressOfEntryPoint:08X}")
        print(f"ImageBase值: 0x{pe.OPTIONAL_HEADER.ImageBase:08X}")
        print(f"节区在磁盘中的最小单位: {pe.OPTIONAL_HEADER.FileAlignment}")
        print(f"节区在内存中的最小单位: {pe.OPTIONAL_HEADER.SectionAlignment}")
        print(f"文件装入内存后的总大小: {pe.OPTIONAL_HEADER.SizeOfImage}")
        print(f"导入表起始RVA: 0x{pe.OPTIONAL_HEADER.DATA_DIRECTORY[pefile.DIRECTORY_ENTRY['IMAGE_DIRECTORY_ENTRY_IMPORT']].VirtualAddress:08X}")
        print(f"导入表大小: {pe.OPTIONAL_HEADER.DATA_DIRECTORY[pefile.DIRECTORY_ENTRY['IMAGE_DIRECTORY_ENTRY_IMPORT']].Size}")

        # 打印节表信息
        print("\n节表信息:")
        for section in pe.sections:
            print(f"节名称: {section.Name.decode().strip()}")
            print(f"节数据装入内存后的RVA: 0x{section.VirtualAddress:08X}")
            print(f"节数据在磁盘上的大小: {section.SizeOfRawData}")
            print()

        # 打印导入表信息
        print("\n导入表信息:")
        if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
            for entry in pe.DIRECTORY_ENTRY_IMPORT:
                print(f"导入的DLL文件: {entry.dll.decode()}")
                for imp in entry.imports:
                    print(f"  函数: {imp.name.decode() if imp.name else 'Ordinal: ' + str(imp.ordinal)}")
        else:
            print("没有导入表信息。")

    except pefile.PEFormatError as e:
        print(f"解析PE文件时出错: {e}")

if __name__ == "__main__":
    # 替换为你要解析的EXE文件路径
    file_path = "新年快乐.exe"
    parse_pe_file(file_path)