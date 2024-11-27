// /components/LanguageDropdown.tsx

"use client";

import React from "react";
import { MenuItem, MenuItems } from "@/components/ui/dropdown-menu";
import useTranslation from "@/hooks/useTranslation";
import { defaultLanguages, Language } from "@/lib/languages";
import { toast } from "@/hooks/use-toast";

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  referenceElement: HTMLElement | null;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  isOpen,
  onClose,
  referenceElement,
}) => {
  const { setLanguage, t } = useTranslation();

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language.code);
    onClose();
    toast({
      title: t("已切换语言至 " + language.name)
    });
  };

  return (
    <MenuItems
      isOpen={isOpen}
      onClose={onClose}
      referenceElement={referenceElement}
      className="w-[200px] max-h-[450px] md:max-h-[350px] overflow-y-auto"
      mobileHeader={{
        title: t('选择语言')
      }}
    >
      {defaultLanguages.map((language) => (
        <MenuItem
          key={language.code}
          onClick={() => handleLanguageSelect(language)}
          className="!flex !items-center !justify-between !p-0"
          rightContent={language.beta && (
            <div className="flex-shrink-0 px-2.5 py-1.5">
              <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">
                {t("测试版")}
              </span>
            </div>
          )}
        >
          <div className="flex flex-col min-w-0 px-2.5 py-1.5">
            <span className="font-medium">{language.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t(language.translationKey)}
            </span>
          </div>
        </MenuItem>
      ))}
    </MenuItems>
  );
};

export default LanguageDropdown;
