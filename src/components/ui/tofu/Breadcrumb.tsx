import {SlashIcon} from "@radix-ui/react-icons"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react";

// 定义面包屑项的类型
interface BreadcrumbItemProps {
    label: string;
    href?: string;
}

// 定义面包屑组件的类型，接收面包屑项和分隔符
interface BreadcrumbWithCustomSeparatorProps {
    items: BreadcrumbItemProps[];
    separator?: React.ReactNode; // 接受自定义分隔符
}

export function BreadcrumbWithCustomSeparator({items, separator = <SlashIcon/>}: BreadcrumbWithCustomSeparatorProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>

                        {/* 如果不是最后一个项，则显示分隔符 */}
                        {index < items.length - 1 && (
                            <BreadcrumbSeparator>
                                {separator}
                            </BreadcrumbSeparator>
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
