// src/form/components/dummy.ts

/**
 * Dummy component: for testing and demonstration purposes only.
 * Not intended for production use.
 */

export interface DummyProps {
  text: string;
}

import { createBaseFormComponent } from './base.factories';
import type { ComponentMetadata } from './base';
import { ComponentIDs } from './base';

export const createDummyComponent = (
  instanceId: string,
  metadata: ComponentMetadata,
  props: DummyProps
) => {
  return createBaseFormComponent(
    ComponentIDs.Dummy,
    instanceId,
    'DummyComponent',
    metadata,
    props
  );
};

export type DummyComponent = ReturnType<typeof createDummyComponent>;
