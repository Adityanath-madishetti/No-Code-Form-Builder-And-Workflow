// src/form/components/ComponentCatalog.tsx
import { useDraggable } from '@dnd-kit/react';
import { catalogRegistry } from '@/form/registry/componentRegistry';
import { useFormStore } from '@/form/store/formStore';

export const CATALOG_COMPONENT_ID = 'catalog-component';
export const CATALOG_PAGE_ID = 'catalog-page';

function DraggableCatalogItem({
  id,
  data,
  label,
  description,
}: {
  id: string;
  data: unknown;
  label: string;
  description: string;
}) {
  const { ref, isDragging } = useDraggable({
    id: id,
    type: (data as Record<string, unknown>).type as string,
    data: data as Record<string, unknown> | undefined,
  });

  return (
    <div className="relative w-full">
      {/* 1. THE REPLICA: Stays perfectly still in the sidebar */}
      <div
        className={`flex w-full flex-col items-start rounded-md border bg-muted p-3 text-muted-foreground transition-opacity duration-200 ${isDragging ? 'border-dashed opacity-50' : 'opacity-0'} `}
      >
        <span className="text-sm font-semibold">{label}</span>
        <span className="mt-0.5 line-clamp-2 text-xs font-normal">
          {description}
        </span>
      </div>

      {/* 2. THE DRAGGABLE ORIGINAL: Sits on top, gets dragged away */}
      <div
        ref={ref}
        className={`absolute top-0 left-0 flex h-full w-full cursor-grab touch-none flex-col items-start rounded-md border border-1 bg-card p-3 text-card-foreground hover:border-primary ${isDragging ? 'z-50 opacity-95' : 'z-10'} `}
      >
        <span className="text-sm font-semibold">{label}</span>
        <span className="mt-0.5 line-clamp-2 text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </div>
    </div>
  );
}

export function ComponentCatalog() {
  const catalogRefreshKey = useFormStore((s) => s.catalogRefreshKey);

  return (
    <>
      <div key={catalogRefreshKey} className="flex flex-col gap-6 p-4">
        {/* STRUCTURE SECTION */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Structure
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <DraggableCatalogItem
              id="
              "
              data={{ type: 'catalog-page' }}
              label="New Page"
              description="Add a new blank page to your form."
            />
          </div>
        </div>

        {/* COMPONENTS SECTION */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Form Fields
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {catalogRegistry.map((entry) => (
              <DraggableCatalogItem
                key={entry.id}
                id={`catalog-${entry.id}`}
                data={{
                  type: 'catalog-component',
                  entry: entry,
                }}
                label={entry.label}
                description={entry.description}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
