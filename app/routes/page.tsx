"use client";

import { useEffect, useState } from "react";
import { Card } from "@heroui/card";
import { Accordion, AccordionItem } from "@heroui/react";
import Link from "next/link";

export default function RoutesPage() {
  const [routes, setRoutes] = useState({ pageRoutes: [], apiRoutes: [] });

  useEffect(() => {
    fetch("/api/routes")
      .then((res) => res.json())
      .then(setRoutes);
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📂 Available Routes</h2>

      {/* Pages Section */}
      <Card>
        <Accordion>
          <AccordionItem key="pages" title="📄 Pages">
            <ul className="space-y-2">
              {routes.pageRoutes.map((route) => (
                <li key={route}>
                  <Link href={route} className="text-blue-600 hover:underline">
                    {route || "/"}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* API Section */}
      <Card>
        <Accordion>
          <AccordionItem key="api" title="🔗 API Endpoints">
            <ul className="space-y-2">
              {routes.apiRoutes.map((route) => (
                <li key={route}>
                  <code className="bg-gray-200 px-2 py-1 rounded">{route}</code>
                </li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
