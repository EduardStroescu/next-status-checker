"use client";

import { Search } from "lucide-react";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../ui/command";
import { SafeProject } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  refreshIndividualProjectAction,
  switchProjectStatus,
} from "@/lib/server/actions";
import { toast } from "sonner";
import { useCommandState } from "cmdk";
import { tinykeys } from "@/../node_modules/tinykeys/dist/tinykeys";

export function SearchForm({
  searchItems,
}: {
  searchItems: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
}) {
  const commandRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const globalListenerUnsub = tinykeys(window, {
      "$mod+k": (evt: KeyboardEvent) => {
        evt.preventDefault();
        setOpen((open) => !open);
      },
    });

    return () => {
      globalListenerUnsub();
    };
  }, []);

  function bounce() {
    if (commandRef.current) {
      commandRef.current.style.transform = "scale(0.96)";
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = "";
        }
      }, 100);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setInputValue("");
      bounce();
    }

    if (!inputValue.length && selectedCategory && e.key === "Backspace") {
      e.preventDefault();
      setSelectedCategory(null);
      bounce();
    }
  };

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent className="relative">
        <button
          onClick={() => setOpen(true)}
          className="pl-8 pr-12.5 text-xs bg-background h-8 w-full rounded-full text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] truncate"
        >
          Type a command or search...
        </button>
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        <kbd className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
        <CommandDialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            setInputValue("");
            setSelectedCategory(null);
          }}
          dialogContentProps={{
            ref: commandRef,
          }}
          commandProps={{
            loop: true,
            onKeyDown: handleKeyDown,
            label: "Global Command Menu",
          }}
          className="bg-cyan-800/40 backdrop-blur-lg border-[1px] border-cyan-500"
        >
          <CommandInput
            value={inputValue}
            onValueChange={(v) => setInputValue(v)}
            autoFocus
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandContent
              commandRef={commandRef}
              searchItems={searchItems}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setOpen={setOpen}
            />
          </CommandList>
        </CommandDialog>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const CommandContent = ({
  commandRef,
  searchItems,
  selectedCategory,
  setSelectedCategory,
  setOpen,
}: {
  commandRef: React.RefObject<HTMLDivElement | null>;
  searchItems: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = useCommandState((state) => state.search);

  const handleNavigate = (
    item: NonNullable<(typeof searchItems)[number]["items"]>[number]
  ) => {
    setOpen(false);
    setSelectedCategory(null);
    const params = new URLSearchParams(searchParams.toString());
    router.push(`${item.internalURL}?${params.toString()}`);
  };

  return (
    <>
      {!!selectedCategory && (
        <CommandGroup
          heading={
            selectedCategory[0].toUpperCase() + selectedCategory.slice(1)
          }
        >
          {searchItems
            .find((category) => category.url === selectedCategory)
            ?.items?.map((item) => (
              <CommandItem
                key={item.name}
                value={item.name + "-" + item.id}
                onSelect={() => handleNavigate(item)}
                className="data-[selected=true]:bg-cyan-800/70"
              >
                <span className="text-xs">{item.name}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      )}

      {!selectedCategory && !!search && (
        <DetailedSearchItems
          searchItems={searchItems}
          handleNavigate={handleNavigate}
        />
      )}

      {!selectedCategory && (
        <>
          <ProjectActions setOpen={setOpen} searchItems={searchItems} />
          <ProjectsPages
            setSelectedCategory={setSelectedCategory}
            searchItems={searchItems}
          />
          <CommandSeparator />
          <UserActions commandRef={commandRef} setOpen={setOpen} />
        </>
      )}
    </>
  );
};

const ProjectActions = ({
  setOpen,
  searchItems,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchItems: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
}) => {
  const pathname = usePathname();
  const projectId = Number(pathname.split("/")[2]);

  const selectedProject = useMemo(() => {
    if (!projectId || isNaN(projectId)) return;

    const match = searchItems.find((category) =>
      category.items?.some((item) => item.id === projectId)
    );

    return match?.items?.find((item) => item.id === projectId);
  }, [projectId, searchItems]);

  const projectActions = useMemo(
    () =>
      selectedProject
        ? [
            {
              name: "Copy URL",
              shortcut: "U",
              onSelect: () => {
                toast.promise(
                  navigator.clipboard.writeText(selectedProject.url),
                  {
                    loading: "Copying URL...",
                    success: () => "Copied URL",
                    error: "Failed to copy URL",
                  }
                );
                setOpen(false);
              },
            },
            {
              name: "Refresh",
              shortcut: "R",
              onSelect: () => {
                toast.promise(
                  refreshIndividualProjectAction(
                    selectedProject.id,
                    selectedProject.category
                  ),
                  {
                    loading: "Refreshing...",
                    success: () => "Refreshed",
                    error: "Failed to refresh",
                  }
                );
                setOpen(false);
              },
            },
            {
              name: selectedProject?.enabled ? "Disable" : "Enable",
              shortcut: "E",
              onSelect: () => {
                toast.promise(
                  switchProjectStatus(
                    selectedProject.id,
                    !selectedProject.enabled
                  ),
                  {
                    loading: selectedProject.enabled
                      ? "Disabling..."
                      : "Enabling...",
                    success: () =>
                      selectedProject.enabled ? "Disabled" : "Enabled",
                    error: selectedProject.enabled
                      ? "Failed to disable"
                      : "Failed to enable",
                  }
                );
                setOpen(false);
              },
            },
          ]
        : [],
    [selectedProject, setOpen]
  );

  if (!selectedProject) return null;

  return (
    <CommandGroup heading={selectedProject.name}>
      {projectActions.map((action) => (
        <CommandItem
          key={action.name}
          onSelect={action.onSelect}
          className="data-[selected=true]:bg-cyan-800/70"
        >
          <span className="text-xs">{action.name}</span>
          <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

const DetailedSearchItems = ({
  searchItems,
  handleNavigate,
}: {
  searchItems: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
  handleNavigate: (
    item: NonNullable<(typeof searchItems)[number]["items"]>[number]
  ) => void;
}) => {
  return searchItems.map((category) => (
    <CommandGroup
      key={category.name}
      value={category.name}
      heading={category.name[0].toUpperCase() + category.name.slice(1)}
    >
      {category.items?.map((item) => (
        <CommandItem
          key={item.id}
          value={item.name + "-" + item.id}
          onSelect={() => handleNavigate(item)}
          className="data-[selected=true]:bg-cyan-800/70"
        >
          <span className="text-xs">{item.name}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  ));
};

const ProjectsPages = ({
  setSelectedCategory,
  searchItems,
}: {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  searchItems: {
    name: string;
    url: string;
    isActive?: boolean;
    items?: (SafeProject & { internalURL: string })[];
  }[];
}) => {
  return (
    <CommandGroup heading="Projects">
      {searchItems.map((item) => (
        <CommandItem
          key={item.name}
          onSelect={() => setSelectedCategory(item.url)}
          className="data-[selected=true]:bg-cyan-800/70"
        >
          <span className="text-xs">{item.name}</span>
          <CommandShortcut>⌘{item.name[0].toUpperCase()}</CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

const UserActions = ({
  commandRef,
  setOpen,
}: {
  commandRef: React.RefObject<HTMLDivElement | null>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const userActions = useMemo(
    () => [
      {
        name: "Log Out",
        shortcut: "o",
        onSelect: () => {
          setOpen(false);
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/auth/logout";

          document.body.appendChild(form);
          form.submit();
        },
      },
    ],
    [setOpen]
  );

  useEffect(() => {
    if (!commandRef.current) return;

    const bindings: Record<string, (event: KeyboardEvent) => void> = {};

    for (const action of userActions) {
      bindings[`$mod+${action.shortcut}`] = action.onSelect;
    }

    const unsub = tinykeys(commandRef.current, bindings);
    return () => unsub();
  }, [commandRef, userActions]);

  return (
    <CommandGroup heading="User">
      {userActions.map((action) => (
        <CommandItem
          key={action.name}
          onSelect={action.onSelect}
          className="data-[selected=true]:bg-cyan-800/70"
        >
          <span className="text-xs">{action.name}</span>
          <CommandShortcut>⌘{action.shortcut.toUpperCase()}</CommandShortcut>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
