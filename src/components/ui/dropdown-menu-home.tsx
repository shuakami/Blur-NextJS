import React, { ReactElement } from 'react';

interface MenuItem {
    icon: string | ReactElement;
    title: string;
    description: string;
}

interface MenuColumn {
    title: string;
    items: MenuItem[];
}

interface DropdownMenuProps {
    items: MenuColumn[];
}

export function DropdownMenu({ items }: DropdownMenuProps): ReactElement {
    const columns = items.length;
    return (
        <div className="flex justify-center items-center min-h-screen bg-white/20 from-orange-400/50 via-orange-400 bg-gradient-to-br">
            <div
                className="rounded-2xl border border-white/20 bg-[rgba(17,17,17,0.75)] shadow-lg backdrop-blur-[50px] py-1"
                style={{
                    boxShadow: 'rgba(0, 0, 0, 0.25) 0px 25px 50px 0px, rgba(0, 0, 0, 0.5) 0px 5px 25px 0px',
                    width: 'fit-content',
                }}
            >
                <ul
                    className="grid gap-x-4 p-4 pl-6 pr-6"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(190px, 1fr))`,
                        width: 'fit-content',
                        height: 'min-content',
                    }}
                >
                    {items.map((column, idx) => (
                        <MenuColumn key={idx} title={column.title} items={column.items} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

function MenuColumn({ title, items }: MenuColumn): ReactElement {
    return (
        <div className="flex flex-col space-y-4">
            <h3
                className="text-sm font-semibold opacity-80 text-[#AAAAAA] pl-1"
                style={{
                    fontSize: '14px',
                    fontWeight: 550,
                    letterSpacing: '-0.01em',
                    lineHeight: '1em',
                    marginBottom: '5px', // 标题与下面内容的间距
                }}
            >
                {title}
            </h3>
            <ul className="space-y-5">
                {items.map((item, index) => (
                    <MenuItem key={index} icon={item.icon} title={item.title} description={item.description} />
                ))}
            </ul>
        </div>
    );
}

function MenuItem({ icon, title, description }: MenuItem): ReactElement {
    return (
        <li
            className="group flex items-start space-x-3 cursor-pointer transition-all duration-500 ease-in-out"
            style={{ height: 'auto', flex: '0 0 auto' }}
        >
            <div
                className="flex-shrink-0 w-10 h-10 rounded bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-[rgba(255,255,255,0.06)] transition-all duration-500 ease-in-out group-hover:bg-white"
                style={{
                    borderRadius: '8px',
                    willChange: 'auto',
                }}
            >
                {renderIcon(icon)}
            </div>
            <div className="flex flex-col">
                <h4
                    className="text-white text-sm font-medium transition-colors duration-500 ease-in-out"
                    style={{ marginBottom: '2px' }}
                >
                    {title}
                </h4>
                <p className="text-[#6E6E6E] text-xs transition-colors duration-500 ease-in-out group-hover:text-white">
                    {description}
                </p>
            </div>
        </li>
    );
}

function renderIcon(icon: string | ReactElement): ReactElement | null {
    if (typeof icon === 'string' && icon.startsWith('<svg')) {
        // 图标是 SVG 字符串
        return (
            <div
                className="transition-all duration-500 ease-in-out group-hover:filter group-hover:invert"
                dangerouslySetInnerHTML={{ __html: icon }}
            />
        );
    } else if (React.isValidElement(icon)) {
        // 图标是 React 组件
        return React.cloneElement(icon, {
            // @ts-ignore
            className: 'text-white transition-all duration-400 ease-in-out group-hover:text-black',
            size: 17.5,
        });
    } else {
        { // 图标是表情符号或简单字符串
            return (
                <span className="text-md transition-all duration-500 ease-in-out group-hover:text-black">{icon}</span>
            );
        }
    }
}